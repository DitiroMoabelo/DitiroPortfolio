# HustleLane — security before hosting

## What is protected

| Item | How |
|------|-----|
| Passwords | bcrypt (12 rounds in prod), never returned in API |
| JWT | Strong `JWT_SECRET`, Bearer auth, Socket.io auth |
| Adzuna keys | Server `.env` only — never sent to React / Vite |
| Mongo injection | `express-mongo-sanitize` |
| HTTP headers | `helmet` |
| Brute force | Rate limits on `/api`, `/auth`, `/lanes` |
| CORS | Only `CLIENT_URL` origin(s) |
| Errors | Generic 500 messages in production |
| Demo accounts | Disabled when `NODE_ENV=production` unless `ENABLE_DEMO_ACCOUNTS=true` |
| Seed wipe | Blocked in production unless `ALLOW_SEED=true` |
| Role escalation | Cannot register as `admin`; `/me` cannot change role/password/email |

`.env` is gitignored (`**/.env`).

## Before you deploy

1. **New secrets on the host** (do not reuse chat/dev values if the repo is public):
   - Generate `JWT_SECRET` (48+ random bytes hex)
   - Prefer **rotating Adzuna keys** (they appeared in chat once)
   - Use MongoDB Atlas with a strong DB user password + network allowlist / IP restriction
2. Set on the API host:
   ```
   NODE_ENV=production
   MONGODB_URI=...
   JWT_SECRET=...
   CLIENT_URL=https://your-frontend.example
   ENABLE_DEMO_ACCOUNTS=false
   ADZUNA_APP_ID=...
   ADZUNA_APP_KEY=...
   ```
3. Frontend build env (public — **no secrets**):
   ```
   VITE_API_URL=https://your-api.example/api
   VITE_SOCKET_URL=https://your-api.example
   # Do NOT set VITE_ENABLE_DEMO=true in production
   ```
4. Use **HTTPS** on both frontend and API (Vercel/Netlify + Render/Railway do this).
5. Do **not** run `npm run seed` against production.
6. Confirm `.env` is not in git: `git check-ignore -v server/.env`

## After deploy — quick checks

- [ ] `/api/health` does not expose secrets
- [ ] Login with empty password fails
- [ ] Demo chips hidden / demo `@hustlelane.dev` logins rejected
- [ ] Browser Network tab: no `ADZUNA_*` or `JWT_SECRET` in JS bundles
- [ ] Lanes still loads (auth required)
- [ ] CORS blocks random origins

## Honest limits (portfolio MVP)

- JWT in `localStorage` is common for SPAs; XSS would be the main risk — keep dependencies updated and avoid `dangerouslySetInnerHTML` on untrusted HTML.
- No email verification / password reset yet — add before treating this as a real user product.
- No CAPTCHA on register — rate limits help; add if abused.
