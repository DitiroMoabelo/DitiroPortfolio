# Portfolio apps

Two full MERN products integrated into Ditiro’s portfolio:

| App | Purpose | Ports |
|-----|---------|-------|
| **[SquadBoard](./squadboard)** | Team Kanban + RBAC + dashboards + realtime | API `5001` · UI `5173` |
| **[HustleLane](./hustlelane)** | SA youth opportunity / job network | API `5002` · UI `5174` |

## Prerequisites

1. **Node.js 18+** (Homebrew: `brew install node`)
2. **MongoDB** — local (`brew install mongodb-community` then `brew services start mongodb-community`) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI in each server `.env`

## Run locally

```bash
# Terminal 1 — SquadBoard API
cd squadboard/server && npm install && npm run seed && npm run dev

# Terminal 2 — SquadBoard UI
cd squadboard/client && npm install && npm run dev

# Terminal 3 — HustleLane API
cd hustlelane/server && npm install && npm run seed && npm run dev

# Terminal 4 — HustleLane UI
cd hustlelane/client && npm install && npm run dev
```

Demo passwords are in each app’s README (`demo1234`).

## Deploy (next step)

Recommended production shape per app:

- **MongoDB Atlas** — database
- **Render / Railway** — Express + Socket.io API
- **Vercel / Netlify** — React frontend  
- Set `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET`, and frontend `VITE_API_URL` / `VITE_SOCKET_URL`

Then replace the portfolio card “Setup guide” links with live URLs.
