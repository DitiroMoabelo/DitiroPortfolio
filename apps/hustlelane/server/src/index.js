import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { loadEnv } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, sanitizeInput } from './middleware/security.js';
import { setupSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import opportunityRoutes from './routes/opportunities.js';
import applicationRoutes from './routes/applications.js';
import notificationRoutes from './routes/notifications.js';
import laneRoutes from './routes/lanes.js';
import { getAdzunaStatus } from './services/externalJobs.js';
import { User } from './models/User.js';
import { seedDatabase } from './seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv();
const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.set('envConfig', env);

const io = new Server(server, {
  cors: {
    origin: env.clientOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});
app.set('io', io);
setupSocket(io);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (env.clientOrigins.includes(normalized)) return cb(null, true);
      if (
        normalized.endsWith('.github.io') &&
        env.clientOrigins.some((o) => o.endsWith('.github.io'))
      ) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(sanitizeInput());
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'hustlelane',
    time: new Date().toISOString(),
    env: env.nodeEnv,
    lanes: {
      remotive: true,
      adzunaConfigured: getAdzunaStatus().configured,
    },
    demoAccounts: env.enableDemoAccounts,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/lanes', laneRoutes);

// Optional: serve Vite build from the same host (Render all-in-one)
const clientDist = path.resolve(__dirname, '../../client/dist');
if (env.serveClient && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

async function start() {
  // Prefer Atlas URI; fall back to memory DB when configured
  if (!process.env.MONGODB_URI && env.useMemoryDb) {
    process.env.USE_MEMORY_DB = 'true';
  }
  await connectDatabase();

  if (env.bootSeed) {
    const users = await User.countDocuments();
    if (users === 0) {
      console.log('Empty database — seeding demo data…');
      await seedDatabase({ wipe: false });
    }
  }

  server.listen(env.port, () => {
    console.log(`HustleLane API on port ${env.port} (${env.nodeEnv})`);
    console.log(`CORS origins: ${env.clientOrigins.join(', ')}`);
    console.log(`Adzuna: ${getAdzunaStatus().configured ? 'configured' : 'not configured'}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
