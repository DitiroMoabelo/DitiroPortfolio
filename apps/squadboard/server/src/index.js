import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspaces.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: { origin: clientUrl, methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
});
app.set('io', io);
setupSocket(io);

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'squadboard', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET not set');
  }
  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/squadboard');
  server.listen(PORT, () => {
    console.log(`SquadBoard API on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
