# Gowtham — Historical SEO Portfolio

A from-the-ground-up React Three Fiber rebuild of Gowtham Saravanakumar's portfolio as an original historical city journey: archives, guild, market, library, observatory, watchtower and a private contact chamber.

## What is implemented

- React + Vite application architecture
- Three.js rendered through React Three Fiber
- Drei helpers for procedural particle fields
- GSAP + ScrollTrigger for DOM mission choreography
- Original procedural historical city rendered with React Three Fiber
- Scroll-driven third-person route with guild buildings, banners, torches, mountains and a hooded guide
- Chase / cockpit / wide camera behavior with pointer influence
- Eagle-eye scan pulse on **F** or the city scanner control
- Warm stone, burgundy, royal blue, emerald and antique-gold visual system
- SEO portfolio sections for projects, experience, services, process, skills, writing and contact
- Express API with Prisma/PostgreSQL persistence
- HTTP-only JWT admin login at `/admin`
- Working admin dashboard for projects, services and stored contact submissions
- Contact form validation, honeypot spam check, rate limiting, health endpoint and analytics event endpoint
- Reduced-motion mode and keyboard-accessible DOM content
- Reduced-motion mode and keyboard-accessible DOM content
- Audio OFF by default; optional synthesized engine bed after explicit user action

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` when running the full application locally. Initialise the database with:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Production build and server:

```bash
npm run build
npm start
```

The Express server serves the built `dist/` directory and the `/api/*` routes from one Render web service.

## Render deployment

Create a Render **Web Service** from this repository and add a Render PostgreSQL database. The included `render.yaml` can create both services. Use these commands if entering them manually:

```text
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

Set `DATABASE_URL` to the PostgreSQL connection string, let Render generate a strong `AUTH_SECRET`, and set a private `ADMIN_EMAIL` plus `ADMIN_PASSWORD`. After the first deploy, run the one-time database setup from the Render shell:

```bash
npx prisma db push
npm run db:seed
```

Open `https://YOUR-SERVICE.onrender.com/admin` to manage projects, services and messages. `/api/health` confirms the web service can reach PostgreSQL.

## Controls

- **Scroll** — fly through the mission
- **Mouse / pointer** — camera/ship influence
- **F** — trigger an eagle-eye city scan
- **Camera dock** — Chase / Cockpit / Wide
- **Motion** — toggle reduced-motion presentation
- **Audio** — opt-in only; never autoplays

## Content integrity

The portfolio content stays focused on technical SEO, content systems, analytics and search-led frontend work. The historical city is an original visual metaphor for the archive and investigation brief; it does not use third-party game assets.
