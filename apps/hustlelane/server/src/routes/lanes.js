import { Router } from 'express';
import {
  searchExternalLanes,
  getExternalJob,
  getAdzunaStatus,
  REMOTIVE_CATEGORIES,
} from '../services/externalJobs.js';
import { protect } from '../middleware/auth.js';
import { lanesLimiter } from '../middleware/security.js';

const router = Router();

router.get('/meta', (req, res) => {
  // Never return API keys — only whether Adzuna is configured
  res.json({
    adzuna: getAdzunaStatus(),
    remotiveCategories: REMOTIVE_CATEGORIES,
    notes: [
      'Remotive: public remote-jobs API, SA-friendly location filter.',
      'Adzuna ZA: server-side keys only (never exposed to the browser).',
      'LinkedIn / Indeed / PNet are not scraped.',
    ],
  });
});

router.get('/', protect, lanesLimiter, async (req, res, next) => {
  try {
    const result = await searchExternalLanes(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/job/:source/:externalId', protect, lanesLimiter, async (req, res, next) => {
  try {
    const allowed = new Set(['remotive', 'adzuna']);
    if (!allowed.has(req.params.source)) {
      return res.status(400).json({ message: 'Unknown source' });
    }
    const job = await getExternalJob(`${req.params.source}:${req.params.externalId}`);
    if (!job) {
      return res.status(404).json({
        message: 'Listing not found or expired from cache — search again from Lanes.',
      });
    }
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

export default router;
