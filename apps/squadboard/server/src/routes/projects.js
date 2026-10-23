import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { protect, requireWorkspaceRole } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get(
  '/workspace/:workspaceId',
  requireWorkspaceRole('viewer'),
  async (req, res, next) => {
    try {
      const projects = await Project.find({ workspace: req.workspace._id }).sort({ createdAt: -1 });
      res.json({ projects });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/workspace/:workspaceId',
  requireWorkspaceRole('member'),
  body('name').trim().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const project = await Project.create({
        workspace: req.workspace._id,
        name: req.body.name,
        description: req.body.description || '',
      });
      const io = req.app.get('io');
      io?.to(`workspace:${req.workspace._id}`).emit('project:created', project);
      res.status(201).json({ project });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:projectId', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { Workspace } = await import('../models/Workspace.js');
    const workspace = await Workspace.findById(project.workspace);
    const role = workspace?.getMemberRole(req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a workspace member' });

    const tasks = await Task.find({ project: project._id })
      .populate('assignees', 'name email avatarColor')
      .populate('createdBy', 'name email avatarColor')
      .populate('comments.author', 'name email avatarColor')
      .sort({ order: 1, createdAt: 1 });

    res.json({ project, tasks, yourRole: role });
  } catch (err) {
    next(err);
  }
});

router.patch('/:projectId', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { Workspace } = await import('../models/Workspace.js');
    const workspace = await Workspace.findById(project.workspace);
    const role = workspace?.getMemberRole(req.user._id);
    if (!role || !['owner', 'admin', 'member'].includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    if (req.body.name) project.name = req.body.name;
    if (req.body.description !== undefined) project.description = req.body.description;
    if (req.body.columns) project.columns = req.body.columns;
    await project.save();

    const io = req.app.get('io');
    io?.to(`workspace:${project.workspace}`).emit('project:updated', project);
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

export default router;
