import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

/** General API abuse brake */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — try again shortly.' },
});

/** Stricter brake on login/register (credential stuffing) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts — wait 15 minutes.' },
});

/** Protect Adzuna key quota from being drained via your proxy */
export const lanesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.LANES_RATE_LIMIT_MAX) || 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Lane search rate limit hit — slow down.' },
});

export function sanitizeInput() {
  return mongoSanitize({ replaceWith: '_' });
}
