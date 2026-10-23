# SquadBoard

Team collaboration + project management in one MERN app: **workspaces**, **role-based access**, **Kanban boards**, **team dashboards**, and **realtime notifications** via Socket.io.

## Stack

- **MongoDB** + Mongoose
- **Express** REST API
- **React** (Vite) frontend
- **Node.js** + Socket.io
- JWT auth · RBAC: `owner` · `admin` · `member` · `viewer`

## Quick start

### Prerequisites

- Node 18+
- MongoDB running locally (or set `MONGODB_URI` to Atlas)

### Server

```bash
cd server
cp .env.example .env   # if needed
npm install
npm run seed
npm run dev
```

API: `http://localhost:5001`

### Client

```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173`

## Demo accounts

Password for all: `demo1234`

| Role   | Email                   |
|--------|-------------------------|
| Owner  | thabo@squadboard.dev    |
| Admin  | lerato@squadboard.dev   |
| Member | sipho@squadboard.dev    |
| Viewer | ayesha@squadboard.dev   |

Sign in as different roles to see permissions (viewers cannot move cards).

## What it proves

- Full MERN production shape (DB, REST, React, auth)
- Workspace membership + RBAC enforcement
- Kanban task tracking with comments & assignees
- Team dashboard (workload, overdue, status)
- Realtime board + notification updates (Socket.io)
