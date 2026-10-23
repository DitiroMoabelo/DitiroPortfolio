import 'dotenv/config';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Workspace } from './models/Workspace.js';
import { Project } from './models/Project.js';
import { Task } from './models/Task.js';
import { Notification } from './models/Notification.js';

async function seed() {
  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/squadboard');

  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const [owner, admin, member, viewer] = await User.create([
    { name: 'Thabo Nkosi', email: 'thabo@squadboard.dev', password: 'demo1234', avatarColor: '#2D6A4F' },
    { name: 'Lerato Molefe', email: 'lerato@squadboard.dev', password: 'demo1234', avatarColor: '#BC4749' },
    { name: 'Sipho Dlamini', email: 'sipho@squadboard.dev', password: 'demo1234', avatarColor: '#E09F3E' },
    { name: 'Ayesha Patel', email: 'ayesha@squadboard.dev', password: 'demo1234', avatarColor: '#335C67' },
  ]);

  const workspace = await Workspace.create({
    name: 'Mzansi Product Squad',
    description: 'Demo workspace for a Johannesburg product team — try every role.',
    members: [
      { user: owner._id, role: 'owner' },
      { user: admin._id, role: 'admin' },
      { user: member._id, role: 'member' },
      { user: viewer._id, role: 'viewer' },
    ],
  });

  const project = await Project.create({
    workspace: workspace._id,
    name: 'Launch Week',
    description: 'Kanban board for the SquadBoard portfolio demo',
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await Task.create([
    {
      project: project._id,
      workspace: workspace._id,
      title: 'Wire JWT auth + role guards',
      description: 'Owner/admin/member/viewer enforcement on workspace routes',
      status: 'done',
      priority: 'high',
      assignees: [owner._id],
      order: 0,
      labels: ['backend', 'security'],
      createdBy: owner._id,
    },
    {
      project: project._id,
      workspace: workspace._id,
      title: 'Realtime board updates (Socket.io)',
      description: 'Broadcast task moves to everyone on the board',
      status: 'doing',
      priority: 'urgent',
      assignees: [admin._id, member._id],
      dueDate: tomorrow,
      order: 0,
      labels: ['realtime'],
      createdBy: owner._id,
    },
    {
      project: project._id,
      workspace: workspace._id,
      title: 'Team dashboard metrics',
      description: 'Workload, overdue, status breakdown',
      status: 'todo',
      priority: 'medium',
      assignees: [member._id],
      dueDate: tomorrow,
      order: 0,
      labels: ['frontend'],
      createdBy: admin._id,
    },
    {
      project: project._id,
      workspace: workspace._id,
      title: 'Invite flow + notifications',
      description: 'Email invite + in-app notification bell',
      status: 'review',
      priority: 'high',
      assignees: [admin._id],
      order: 0,
      labels: ['ux'],
      createdBy: owner._id,
    },
    {
      project: project._id,
      workspace: workspace._id,
      title: 'Polish Kanban drag states',
      description: 'Visual feedback when cards move columns',
      status: 'backlog',
      priority: 'low',
      assignees: [member._id],
      dueDate: yesterday,
      order: 0,
      labels: ['polish'],
      createdBy: member._id,
    },
  ]);

  console.log('\nSquadBoard seed complete.\n');
  console.log('Demo logins (password: demo1234):');
  console.log('  owner  thabo@squadboard.dev');
  console.log('  admin  lerato@squadboard.dev');
  console.log('  member sipho@squadboard.dev');
  console.log('  viewer ayesha@squadboard.dev');
  console.log(`\nWorkspace: ${workspace.name} (${workspace._id})`);
  console.log(`Project:   ${project.name} (${project._id})\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
