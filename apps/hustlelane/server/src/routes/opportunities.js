import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Opportunity } from '../models/Opportunity.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = { status: 'open' };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.province) filter.province = req.query.province;
    if (req.query.metro) filter.metro = req.query.metro;
    if (req.query.remote === 'true') filter.remote = true;
    if (req.query.loadSheddingFriendly === 'true') filter.loadSheddingFriendly = true;
    if (req.query.paid === 'true') filter.unpaid = false;
    if (req.query.q) filter.$text = { $search: req.query.q };

    const opportunities = await Opportunity.find(filter)
      .populate('postedBy', 'name company metro avatarColor')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
});

router.get('/meta/filters', (req, res) => {
  res.json({
    types: ['learnership', 'bursary', 'internship', 'gig', 'entry-level', 'freelance'],
    provinces: [
      'Gauteng',
      'Western Cape',
      'KwaZulu-Natal',
      'Eastern Cape',
      'Free State',
      'Limpopo',
      'Mpumalanga',
      'North West',
      'Northern Cape',
    ],
    metros: [
      'Johannesburg',
      'Soweto',
      'Pretoria',
      'Sandton',
      'Braamfontein',
      'Cape Town',
      'Khayelitsha',
      'Durban',
      'Pietermaritzburg',
      'Gqeberha',
      'Bloemfontein',
      'Remote SA',
    ],
  });
});

router.get('/:id', async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      'postedBy',
      'name headline metro province whatsapp avatarColor'
    );
    if (!opportunity) return res.status(404).json({ message: 'Not found' });
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  protect,
  requireRole('poster', 'admin'),
  body('title').trim().notEmpty(),
  body('company').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('type').isIn(['learnership', 'bursary', 'internship', 'gig', 'entry-level', 'freelance']),
  body('province').trim().notEmpty(),
  body('metro').trim().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const opportunity = await Opportunity.create({
        ...req.body,
        postedBy: req.user._id,
        stipendZar: req.body.unpaid ? 0 : Number(req.body.stipendZar || 0),
      });

      const io = req.app.get('io');
      const seekers = await User.find({
        role: 'seeker',
        $or: [{ metro: opportunity.metro }, { province: opportunity.province }, { metro: '' }],
      }).limit(50);

      for (const seeker of seekers) {
        const notification = await Notification.create({
          user: seeker._id,
          type: 'new_opportunity',
          title: `New ${opportunity.type} near you`,
          body: `${opportunity.title} · ${opportunity.company} · ${opportunity.metro}`,
          link: `/opportunities/${opportunity._id}`,
        });
        io?.to(`user:${seeker._id}`).emit('notification:new', notification);
      }

      io?.emit('opportunity:created', opportunity);
      res.status(201).json({ opportunity });
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Not found' });
    if (opportunity.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your posting' });
    }
    const fields = [
      'title',
      'company',
      'description',
      'type',
      'province',
      'metro',
      'remote',
      'stipendZar',
      'unpaid',
      'loadSheddingFriendly',
      'tags',
      'whatsappContact',
      'applyUrl',
      'deadline',
      'status',
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) opportunity[f] = req.body[f];
    }
    await opportunity.save();
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
});

export default router;
