# Deploy HustleLane (GitHub Pages + Render API)

GitHub Pages can only host the **React frontend**. The **API + MongoDB + Adzuna keys** run on Render.

## Live URLs (after deploy)

| Piece | URL |
|-------|-----|
| Frontend (GitHub Pages) | `https://ditiromoabelo.github.io/DitiroPortfolio/hustlelane/` |
| API (Render) | `https://<your-service>.onrender.com` |

## 1. MongoDB Atlas (free)

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Database Access → user + password  
3. Network Access → **Allow access from anywhere** (`0.0.0.0/0`) for Render  
4. Copy connection string, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/hustlelane?retryWrites=true&w=majority`

## 2. Render API

1. [dashboard.render.com](https://dashboard.render.com) → New → Blueprint  
   **or** New Web Service → connect `DitiroMoabelo/DitiroPortfolio`  
2. Root directory: `apps/hustlelane/server`  
3. Build: `npm install` · Start: `npm start`  
4. Environment:

```
NODE_ENV=production
MONGODB_URI=<atlas uri>
JWT_SECRET=<long random string>
CLIENT_URL=https://ditiromoabelo.github.io
ENABLE_DEMO_ACCOUNTS=false
ADZUNA_APP_ID=<your id>
ADZUNA_APP_KEY=<your key>
ADZUNA_COUNTRY=za
```

5. After first deploy, from your machine (once):

```bash
cd apps/hustlelane/server
MONGODB_URI='<atlas uri>' NODE_ENV=development ALLOW_SEED=true npm run seed
```

(Or temporarily set `ENABLE_DEMO_ACCOUNTS=true` and seed, then turn demos off.)

## 3. GitHub Pages frontend

Repo secret (Settings → Secrets → Actions):

- `VITE_HUSTLELANE_API_URL` = `https://<your-service>.onrender.com/api`
- `VITE_HUSTLELANE_SOCKET_URL` = `https://<your-service>.onrender.com`

Then run workflow **Deploy HustleLane to GitHub Pages**, or build locally:

```bash
cd apps/hustlelane/client
VITE_BASE=/DitiroPortfolio/hustlelane/ \
VITE_API_URL=https://<your-service>.onrender.com/api \
VITE_SOCKET_URL=https://<your-service>.onrender.com \
npm run build
rm -rf ../../../hustlelane && mkdir -p ../../../hustlelane && cp -R dist/* ../../../hustlelane/
```

Commit the `hustlelane/` folder so Pages serves it.

## 4. Portfolio card

Point the HustleLane project buttons at:

- Live: `https://ditiromoabelo.github.io/DitiroPortfolio/hustlelane/`
- Code: this repo `apps/hustlelane`
