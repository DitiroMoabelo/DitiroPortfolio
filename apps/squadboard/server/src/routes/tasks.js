import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Workspace } from '../models/Workspace.js';
import { protect } from '../middleware/auth.js';
import { createAndEmitNotification } from '../utils/notify.js';

const router = Router();
router.use(protect);

async function loadProjectAccess(req, minRoles = ['owner', 'admin', 'member', 'viewer']) {
  const project = await Project.findById(req.params.projectId || req.body.projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  const workspace = await Workspace.findById(project.workspace);
  const role = workspace?.getMemberRole(req.user._id);
  if (!role || !minRoles.includes(role)) {
    const err = new Error('Insufficient permissions');
    err.statusCode = 403;
    throw err;
  }
  return { project, workspace, role };
}

router.post(
  '/project/:projectId',
  body('title').trim().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { project, role } = await loadProjectAccess(req, ['owner', 'admin', 'member']);
      if (role === 'viewer') {
        return res.status(403).json({ message: 'Viewers cannot create tasks' });
      }

      const status = req.body.status || 'todo';
      const maxOrder = await Task.findOne({ project: project._id, status })
        .sort({ order: -1 })
        .select('order');

      const task = await Task.create({
        project: project._id,
        workspace: project.workspace,
        title: req.body.title,
        description: req.body.description || '',
        status,
        priority: req.body.priority || 'medium',
        assignees: req.body.assignees || [],
        dueDate: req.body.dueDate || undefined,
        labels: req.body.labels || [],
        order: (maxOrder?.order ?? -1) + 1,
        createdBy: req.user._id,
      });

      await task.populate('assignees', 'name email avatarColor');
      await task.populate('createdBy', 'name email avatarColor');

      const io = req.app.get('io');
      io?.to(`project:${project._id}`).emit('task:created', task);

      for (const assigneeId of task.assignees) {
        if (assigneeId._id.toString() !== req.user._id.toString()) {
          await createAndEmitNotification(io, {
            userId: assigneeId._id,
            type: 'task_assigned',
            title: 'New task assigned',
            body: `${req.user.name} assigned you “${task.title}”`,
            link: `/projects/${project._id}`,
            meta: { taskId: task._id, projectId: project._id },
          });
        }
      }

      res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:taskId', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    req.params.projectId = task.project.toString();
    const { project, role } = await loadProjectAccess(req, ['owner', 'admin', 'member']);
    if (role === 'viewer') {
      return res.status(403).json({ message: 'Viewers cannot edit tasks' });
    }

    const prevStatus = task.status;
    const prevAssignees = task.assignees.map((id) => id.toString());

    const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'labels', 'order', 'assignees'];
    for (const field of fields) {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    }
    await task.save();
    await task.populate('assignees', 'name email avatarColor');
    await task.populate('createdBy', 'name email avatarColor');
    await task.populate('comments.author', 'name email avatarColor');

    const io = req.app.get('io');
    io?.to(`project:${project._id}`).emit('task:updated', task);

    if (req.body.status && req.body.status !== prevStatus) {
      for (const a of task.assignees) {
        await createAndEmitNotification(io, {
          userId: a._id,
          type: 'task_moved',
          title: 'Task moved',
          body: `“${task.title}” moved to ${task.status}`,
          link: `/projects/${project._id}`,
          meta: { taskId: task._id, from: prevStatus, to: task.status },
        });
      }
    }

    if (req.body.assignees) {
      const nextAssignees = task.assignees.map((a) => a._id.toString());
      for (const id of nextAssignees) {
        if (!prevAssignees.includes(id) && id !== req.user._id.toString()) {
          await createAndEmitNotification(io, {
            userId: id,
            type: 'task_assigned',
            title: 'Task assigned to you',
            body: `${req.user.name} assigned you “${task.title}”`,
            link: `/projects/${project._id}`,
            meta: { taskId: task._id },
          });
        }
      }
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.post('/:taskId/comments', body('body').trim().notEmpty(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    req.params.projectId = task.project.toString();
    const { project, role } = await loadProjectAccess(req, ['owner', 'admin', 'member']);
    if (role === 'viewer') {
      return res.status(403).json({ message: 'Viewers cannot comment' });
    }

    task.comments.push({ author: req.user._id, body: req.body.body });
    await task.save();
    await task.populate('comments.author', 'name email avatarColor');
    await task.populate('assignees', 'name email avatarColor');

    const io = req.app.get('io');
    io?.to(`project:${project._id}`).emit('task:updated', task);

    const targets = new Set(task.assignees.map((a) => a._id.toString()));
    targets.add(task.createdBy.toString());
    targets.delete(req.user._id.toString());
    for (const userId of targets) {
      await createAndEmitNotification(io, {
        userId,
        type: 'comment',
        title: 'New comment',
        body: `${req.user.name} on “${task.title}”: ${req.body.body.slice(0, 80)}`,
        link: `/projects/${project._id}`,
        meta: { taskId: task._id },
      });
    }

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:taskId', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    req.params.projectId = task.project.toString();
    const { project, role } = await loadProjectAccess(req, ['owner', 'admin', 'member']);
    if (role === 'viewer') {
      return res.status(403).json({ message: 'Viewers cannot delete tasks' });
    }

    await task.deleteOne();
    const io = req.app.get('io');
    io?.to(`project:${project._id}`).emit('task:deleted', { taskId: req.params.taskId, projectId: project._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
