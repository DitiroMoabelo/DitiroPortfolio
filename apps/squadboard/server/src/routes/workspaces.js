import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Workspace } from '../models/Workspace.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { protect, requireWorkspaceRole, ROLE_RANK } from '../middleware/auth.js';
import { createAndEmitNotification } from '../utils/notify.js';

const router = Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatarColor')
      .sort({ updatedAt: -1 });
    res.json({ workspaces });
  } catch (err) {
    next(err);
  }
});

router.post('/', body('name').trim().notEmpty(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const workspace = await Workspace.create({
      name: req.body.name,
      description: req.body.description || '',
      members: [{ user: req.user._id, role: 'owner' }],
    });
    await workspace.populate('members.user', 'name email avatarColor');
    res.status(201).json({ workspace });
  } catch (err) {
    next(err);
  }
});

router.get('/:workspaceId', requireWorkspaceRole('viewer'), async (req, res) => {
  await req.workspace.populate('members.user', 'name email avatarColor');
  res.json({ workspace: req.workspace, yourRole: req.memberRole });
});

router.patch('/:workspaceId', requireWorkspaceRole('admin'), async (req, res, next) => {
  try {
    if (req.body.name) req.workspace.name = req.body.name;
    if (req.body.description !== undefined) req.workspace.description = req.body.description;
    await req.workspace.save();
    await req.workspace.populate('members.user', 'name email avatarColor');
    res.json({ workspace: req.workspace });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/:workspaceId/members',
  requireWorkspaceRole('admin'),
  body('email').isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'member', 'viewer']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ message: 'No user with that email. They must register first.' });
      }
      const existing = req.workspace.members.find((m) => m.user.toString() === user._id.toString());
      if (existing) {
        return res.status(400).json({ message: 'User already in workspace' });
      }
      const role = req.body.role || 'member';
      req.workspace.members.push({ user: user._id, role });
      await req.workspace.save();
      await req.workspace.populate('members.user', 'name email avatarColor');

      const io = req.app.get('io');
      await createAndEmitNotification(io, {
        userId: user._id,
        type: 'workspace_invite',
        title: `Added to ${req.workspace.name}`,
        body: `${req.user.name} added you as ${role}`,
        link: `/workspaces/${req.workspace._id}`,
      });

      res.status(201).json({ workspace: req.workspace });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:workspaceId/members/:userId',
  requireWorkspaceRole('admin'),
  body('role').isIn(['admin', 'member', 'viewer', 'owner']),
  async (req, res, next) => {
    try {
      const member = req.workspace.members.find((m) => m.user.toString() === req.params.userId);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      if (member.role === 'owner' && req.memberRole !== 'owner') {
        return res.status(403).json({ message: 'Only owner can change owner role' });
      }
      if (req.body.role === 'owner' && req.memberRole !== 'owner') {
        return res.status(403).json({ message: 'Only owner can transfer ownership' });
      }
      if (ROLE_RANK[req.body.role] > ROLE_RANK[req.memberRole] && req.memberRole !== 'owner') {
        return res.status(403).json({ message: 'Cannot assign a higher role than your own' });
      }
      member.role = req.body.role;
      await req.workspace.save();
      await req.workspace.populate('members.user', 'name email avatarColor');
      res.json({ workspace: req.workspace });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:workspaceId/dashboard', requireWorkspaceRole('viewer'), async (req, res, next) => {
  try {
    const projects = await Project.find({ workspace: req.workspace._id });
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } }).populate(
      'assignees',
      'name email avatarColor'
    );

    const byStatus = {};
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    const workload = {};
    let overdue = 0;
    const now = new Date();

    for (const task of tasks) {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      if (task.dueDate && task.dueDate < now && task.status !== 'done') overdue += 1;
      for (const a of task.assignees) {
        const key = a._id.toString();
        if (!workload[key]) {
          workload[key] = { user: a, open: 0, done: 0 };
        }
        if (task.status === 'done') workload[key].done += 1;
        else workload[key].open += 1;
      }
    }

    res.json({
      summary: {
        projectCount: projects.length,
        taskCount: tasks.length,
        overdue,
        done: byStatus.done || 0,
      },
      byStatus,
      byPriority,
      workload: Object.values(workload),
      yourRole: req.memberRole,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
