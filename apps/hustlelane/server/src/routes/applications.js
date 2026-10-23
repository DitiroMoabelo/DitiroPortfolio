import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Application } from '../models/Application.js';
import { Opportunity } from '../models/Opportunity.js';
import { Notification } from '../models/Notification.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post(
  '/',
  requireRole('seeker', 'admin'),
  body('opportunityId').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const opportunity = await Opportunity.findById(req.body.opportunityId);
      if (!opportunity || opportunity.status !== 'open') {
        return res.status(404).json({ message: 'Opportunity not open' });
      }

      const application = await Application.create({
        opportunity: opportunity._id,
        seeker: req.user._id,
        coverNote: req.body.coverNote || '',
      });

      opportunity.applicantsCount += 1;
      await opportunity.save();

      const io = req.app.get('io');
      const notification = await Notification.create({
        user: opportunity.postedBy,
        type: 'application_update',
        title: 'New application',
        body: `${req.user.name} applied to “${opportunity.title}”`,
        link: `/opportunities/${opportunity._id}`,
      });
      io?.to(`user:${opportunity.postedBy}`).emit('notification:new', notification);

      res.status(201).json({ application });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/mine', async (req, res, next) => {
  try {
    if (req.user.role === 'poster' || req.user.role === 'admin') {
      const myOps = await Opportunity.find({ postedBy: req.user._id }).select('_id');
      const ids = myOps.map((o) => o._id);
      const applications = await Application.find({ opportunity: { $in: ids } })
        .populate('seeker', 'name email headline skills metro whatsapp avatarColor')
        .populate('opportunity', 'title company metro type')
        .sort({ createdAt: -1 });
      return res.json({ applications });
    }

    const applications = await Application.find({ seeker: req.user._id })
      .populate('opportunity')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', requireRole('poster', 'admin'), async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('opportunity');
    if (!application) return res.status(404).json({ message: 'Not found' });
    if (
      application.opportunity.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    application.status = req.body.status;
    await application.save();

    const io = req.app.get('io');
    const notification = await Notification.create({
      user: application.seeker,
      type: 'application_update',
      title: 'Application update',
      body: `Your application for “${application.opportunity.title}” is now ${application.status}`,
      link: `/applications`,
    });
    io?.to(`user:${application.seeker}`).emit('notification:new', notification);

    res.json({ application });
  } catch (err) {
    next(err);
  }
});

export default router;
