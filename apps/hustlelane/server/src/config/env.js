/**
 * Load + validate environment. Fail closed in production if secrets are missing/weak.
 */

const WEAK_SECRETS = new Set([
  '',
  'change-me',
  'change-me-to-a-long-random-string',
  'hustlelane-dev-secret-change-in-production',
  'secret',
  'jwt_secret',
]);

export function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  const useMemoryDb = process.env.USE_MEMORY_DB === 'true';

  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret || WEAK_SECRETS.has(jwtSecret) || jwtSecret.length < 32) {
    if (isProd) {
      console.error('FATAL: Set a strong JWT_SECRET (32+ random chars) before production.');
      process.exit(1);
    }
    console.warn('Warning: JWT_SECRET is weak or missing — generate one before hosting.');
  }

  if (isProd && !process.env.MONGODB_URI && !useMemoryDb) {
    console.error('FATAL: Set MONGODB_URI or USE_MEMORY_DB=true for production.');
    process.exit(1);
  }

  const clientOrigins = String(
    process.env.CLIENT_URL ||
      'http://localhost:5174,https://ditiromoabelo.github.io'
  )
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return {
    nodeEnv,
    isProd,
    useMemoryDb,
    port: Number(process.env.PORT) || 5002,
    mongoUri: process.env.MONGODB_URI || '',
    jwtSecret: jwtSecret || 'dev-only-insecure-secret-do-not-host',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    clientOrigins,
    // Portfolio demos: allow demo logins when explicitly enabled OR on memory-db demos
    enableDemoAccounts:
      process.env.ENABLE_DEMO_ACCOUNTS === 'true' || (!isProd && process.env.ENABLE_DEMO_ACCOUNTS !== 'false'),
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || (isProd ? 12 : 10),
    bootSeed: process.env.BOOT_SEED === 'true' || useMemoryDb,
    serveClient: process.env.SERVE_CLIENT === 'true',
  };
}
