# HustleLane

A **South African youth opportunity network** — learnerships, bursaries, gigs, internships, and entry-level roles with metro filters, WhatsApp-first apply links, and load-shedding-friendly tags.

## Stack

MongoDB · Express · React (Vite) · Node · Socket.io · JWT

## Unique (not a LinkedIn clone)

- Metro / township filters (Soweto, Braamfontein, Khayelitsha…)
- Opportunity types youth actually chase (learnership, bursary, gig…)
- ZAR stipends + unpaid flags
- **Load-shedding friendly** listings
- WhatsApp deep-link contact
- Realtime alerts when new opportunities match your area
- **Lanes** — legal imports from **Remotive** (remote, SA-friendly filter) + **Adzuna ZA** (optional API keys)

## External lanes (Remotive + Adzuna)

Community **Feed** = posts in your MongoDB.  
**Lanes** tab = live aggregators (no LinkedIn/Indeed/PNet scraping).

| Source | Needs keys? | What you get |
|--------|-------------|--------------|
| Remotive | No | Remote jobs; filtered for Worldwide / Africa / Remote etc. |
| Adzuna | Yes — free at [developer.adzuna.com](https://developer.adzuna.com/) | South Africa job search (`ADZUNA_COUNTRY=za`) |

Add to `server/.env`:

```
ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
ADZUNA_COUNTRY=za
```

Then restart the API. Filters: keywords, skills, location, Remotive category, source toggle.

## Quick start

```bash
# API
cd server && npm install && npm run seed && npm run dev

# Client (other terminal)
cd client && npm install && npm run dev
```

- API: http://localhost:5002  
- App: http://localhost:5174  

## Demo accounts (local only)

Password: `demo1234` — shown in the UI only when `ENABLE_DEMO_ACCOUNTS=true` (default in development). **Disabled in production.**

| Role   | Email                 |
|--------|-----------------------|
| Seeker | nomsa@hustlelane.dev  |
| Poster | kagiso@hustlelane.dev |
| Poster | farah@hustlelane.dev  |

## Security before hosting

See **[SECURITY.md](./SECURITY.md)** — secrets stay in server `.env`, rate limits, helmet, CORS lock, demo lockout, and a deploy checklist.
