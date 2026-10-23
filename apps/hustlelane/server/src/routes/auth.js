import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    headline: user.headline,
    bio: user.bio,
    skills: user.skills,
    metro: user.metro,
    province: user.province,
    whatsapp: user.whatsapp,
    dataSaver: user.dataSaver,
    avatarColor: user.avatarColor,
  };
}

router.get('/config', (req, res) => {
  const env = req.app.get('envConfig');
  res.json({
    demoAccounts: Boolean(env?.enableDemoAccounts),
    adzunaConfigured: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
  });
});

router.post(
  '/register',
  authLimiter,
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['seeker', 'poster']),
  body('whatsapp')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+]{8,20}$/)
    .withMessage('WhatsApp must be digits / + only'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      // Never allow elevating to admin via public register
      const role = req.body.role === 'poster' ? 'poster' : 'seeker';

      const exists = await User.findOne({ email: req.body.email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });

      const colors = ['#F4A261', '#2A9D8F', '#E76F51', '#264653', '#E9C46A', '#1D3557'];
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role,
        metro: String(req.body.metro || '').slice(0, 80),
        province: String(req.body.province || '').slice(0, 80),
        skills: Array.isArray(req.body.skills) ? req.body.skills.slice(0, 20) : [],
        whatsapp: req.body.whatsapp || '',
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
      });
      const token = signToken(user._id);
      res.status(201).json({ token, user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password is required'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const env = req.app.get('envConfig');
      // Block well-known demo logins in production unless explicitly enabled
      if (
        env &&
        !env.enableDemoAccounts &&
        String(req.body.email).endsWith('@hustlelane.dev')
      ) {
        return res.status(403).json({ message: 'Demo accounts are disabled on this deployment' });
      }

      const user = await User.findOne({ email: req.body.email }).select('+password');
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.json({ token: signToken(user._id), user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch(
  '/me',
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('headline').optional().isLength({ max: 160 }),
  body('bio').optional().isLength({ max: 2000 }),
  body('whatsapp')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+]{8,20}$/),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      // Explicit allow-list — never accept role/password/email from this route
      const fields = ['name', 'headline', 'bio', 'skills', 'metro', 'province', 'whatsapp', 'dataSaver'];
      for (const f of fields) {
        if (req.body[f] !== undefined) {
          if (f === 'skills' && Array.isArray(req.body.skills)) {
            req.user.skills = req.body.skills.map(String).slice(0, 20);
          } else if (f !== 'skills') {
            req.user[f] = req.body[f];
          }
        }
      }
      await req.user.save();
      res.json({ user: publicUser(req.user) });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
