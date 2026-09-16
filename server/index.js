import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 10000);
const AUTH_SECRET = process.env.AUTH_SECRET || 'development-only-change-this-secret';
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

const text = (max = 5000) => z.string().trim().min(1).max(max);
const optionalText = (max = 5000) => z.string().trim().max(max).optional().nullable();
const loginSchema = z.object({ email: z.string().trim().email().max(200), password: text(200) });
const contactSchema = z.object({
  name: text(120),
  email: z.string().trim().email().max(200),
  website: optionalText(300),
  industry: optionalText(160),
  seoGoal: optionalText(500),
  project: optionalText(500),
  message: text(5000),
  _honey: z.string().max(100).optional()
});
const eventSchema = z.object({ event: text(100), path: optionalText(500), metadata: z.record(z.string(), z.unknown()).optional() });

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, AUTH_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('gowtham_session', token, { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
}

function requireAuth(req, res, next) {
  const token = req.cookies.gowtham_session;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, AUTH_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired' });
  }
}

function safeValue(value, max = 5000) {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') return value.trim().slice(0, max);
  return value;
}

function dataFor(definition, body, partial = false) {
  const output = {};
  for (const [key, config] of Object.entries(definition)) {
    if (body[key] === undefined && partial) continue;
    if (body[key] === undefined) {
      if (config.required) throw new Error(`${key} is required`);
      continue;
    }
    if (config.type === 'number') {
      const value = Number(body[key]);
      if (!Number.isFinite(value)) throw new Error(`${key} must be a number`);
      output[key] = Math.round(value);
    } else if (config.type === 'boolean') {
      output[key] = Boolean(body[key]);
    } else if (config.type === 'json') {
      output[key] = body[key];
    } else {
      output[key] = safeValue(body[key], config.max || 5000);
    }
  }
  return output;
}

const collections = {
  services: { delegate: 'service', order: 'sortOrder', fields: { name: { required: true, max: 120 }, tagline: { required: true, max: 240 }, description: { required: true, max: 2000 }, icon: { max: 100 }, sortOrder: { type: 'number' } } },
  projects: { delegate: 'project', order: 'sortOrder', fields: { name: { required: true, max: 160 }, type: { required: true, max: 180 }, body: { required: true, max: 3000 }, challenge: { required: true, max: 3000 }, approach: { required: true, max: 3000 }, result: { required: true, max: 3000 }, url: { max: 500 }, tech: { type: 'json' }, imageUrl: { max: 500 }, featured: { type: 'boolean' }, sortOrder: { type: 'number' } } },
  experience: { delegate: 'experience', order: 'sortOrder', fields: { period: { required: true, max: 100 }, organisation: { required: true, max: 180 }, role: { required: true, max: 180 }, summary: { required: true, max: 3000 }, bullets: { type: 'json' }, sortOrder: { type: 'number' } } },
  skills: { delegate: 'skill', order: 'sortOrder', fields: { name: { required: true, max: 120 }, description: { required: true, max: 2000 }, sortOrder: { type: 'number' } } },
  tools: { delegate: 'tool', order: 'sortOrder', fields: { name: { required: true, max: 120 }, purpose: { required: true, max: 2000 }, url: { max: 500 }, sortOrder: { type: 'number' } } },
  achievements: { delegate: 'achievement', order: 'sortOrder', fields: { label: { required: true, max: 160 }, value: { required: true, max: 120 }, description: { max: 1000 }, sortOrder: { type: 'number' } } },
  testimonials: { delegate: 'testimonial', order: 'sortOrder', fields: { quote: { required: true, max: 3000 }, name: { required: true, max: 160 }, role: { max: 160 }, company: { max: 160 }, sortOrder: { type: 'number' } } },
  'case-studies': { delegate: 'caseStudy', order: 'createdAt', fields: { title: { required: true, max: 200 }, client: { required: true, max: 160 }, challenge: { required: true, max: 3000 }, investigation: { required: true, max: 3000 }, strategy: { required: true, max: 3000 }, execution: { required: true, max: 3000 }, result: { required: true, max: 3000 }, metrics: { type: 'json' }, url: { max: 500 } } }
};

async function databaseOr503(res, operation) {
  try { return await operation(); } catch (error) {
    console.error('Database request failed:', error.message);
    res.status(503).json({ error: 'Database unavailable. Check DATABASE_URL and run the Prisma setup.' });
    return null;
  }
}

app.get('/api/health', async (_req, res) => {
  const result = await databaseOr503(res, () => prisma.$queryRaw`SELECT 1`);
  if (result) res.json({ ok: true, database: 'connected' });
});

app.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email and password.' });
  const user = await databaseOr503(res, () => prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } }));
  if (!user) return res.headersSent ? undefined : res.status(401).json({ error: 'Invalid login details' });
  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid login details' });
  setAuthCookie(res, signToken(user));
  return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/logout', (_req, res) => { res.clearCookie('gowtham_session', { path: '/' }); res.json({ ok: true }); });
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user }));

app.get('/api/content', async (_req, res) => {
  const data = await databaseOr503(res, async () => {
    const [profile, services, projects, experience, skills, tools, achievements, testimonials, settings] = await Promise.all([
      prisma.profile.findFirst(), prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }), prisma.project.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.experience.findMany({ orderBy: { sortOrder: 'asc' } }), prisma.skill.findMany({ orderBy: { sortOrder: 'asc' } }), prisma.tool.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } }), prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }), prisma.siteSettings.findFirst()
    ]);
    return { profile, services, projects, experience, skills, tools, achievements, testimonials, settings };
  });
  if (data) res.json(data);
});

app.get('/api/profile', async (_req, res) => {
  const data = await databaseOr503(res, () => prisma.profile.findFirst());
  if (data) res.json(data);
});

app.put('/api/profile', requireAuth, async (req, res) => {
  const fields = { name: text(160), headline: text(240), bio: text(5000), location: text(240), email: z.string().email(), phone: optionalText(60), linkedin: optionalText(500), medium: optionalText(500), twitter: optionalText(500), avatarUrl: optionalText(500) };
  const parsed = z.object(fields).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please complete the profile fields correctly.' });
  const existing = await databaseOr503(res, () => prisma.profile.findFirst());
  if (existing === null) return;
  const data = await databaseOr503(res, () => existing ? prisma.profile.update({ where: { id: existing.id }, data: parsed.data }) : prisma.profile.create({ data: parsed.data }));
  if (data) res.json(data);
});

for (const [route, definition] of Object.entries(collections)) {
  app.get(`/api/${route}`, async (_req, res) => {
    const records = await databaseOr503(res, () => prisma[definition.delegate].findMany({ orderBy: { [definition.order]: 'asc' } }));
    if (records) res.json(records);
  });
  app.post(`/api/${route}`, requireAuth, async (req, res) => {
    try {
      const data = await databaseOr503(res, () => prisma[definition.delegate].create({ data: dataFor(definition.fields, req.body) }));
      if (data) res.status(201).json(data);
    } catch (error) { if (!res.headersSent) res.status(400).json({ error: error.message }); }
  });
  app.put(`/api/${route}/:id`, requireAuth, async (req, res) => {
    try {
      const data = await databaseOr503(res, () => prisma[definition.delegate].update({ where: { id: req.params.id }, data: dataFor(definition.fields, req.body, true) }));
      if (data) res.json(data);
    } catch (error) { if (!res.headersSent) res.status(400).json({ error: error.message }); }
  });
  app.delete(`/api/${route}/:id`, requireAuth, async (req, res) => {
    try {
      const data = await databaseOr503(res, () => prisma[definition.delegate].delete({ where: { id: req.params.id } }));
      if (data) res.json({ ok: true });
    } catch (error) { if (!res.headersSent) res.status(400).json({ error: error.message }); }
  });
}

app.put('/api/settings', requireAuth, async (req, res) => {
  const parsed = z.object({ siteTitle: text(200), siteDescription: text(1000), theme: text(80) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please complete the site settings.' });
  const data = await databaseOr503(res, () => prisma.siteSettings.upsert({ where: { id: 'settings-main' }, update: parsed.data, create: { id: 'settings-main', ...parsed.data } }));
  if (data) res.json(data);
});

app.post('/api/contact', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please complete all required contact fields.' });
  if (parsed.data._honey) return res.status(400).json({ error: 'Spam check failed.' });
  const data = await databaseOr503(res, () => prisma.contactMessage.create({ data: { name: parsed.data.name, email: parsed.data.email, website: parsed.data.website || parsed.data.project || null, industry: parsed.data.industry || null, seoGoal: parsed.data.seoGoal || null, message: parsed.data.message } }));
  if (data) res.status(201).json({ ok: true, message: 'Mission received. I will reply shortly.' });
});

app.get('/api/contact', requireAuth, async (_req, res) => {
  const data = await databaseOr503(res, () => prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }));
  if (data) res.json(data);
});

app.patch('/api/contact/:id', requireAuth, async (req, res) => {
  const status = z.enum(['new', 'read', 'archived']).safeParse(req.body.status);
  if (!status.success) return res.status(400).json({ error: 'Invalid status' });
  const data = await databaseOr503(res, () => prisma.contactMessage.update({ where: { id: req.params.id }, data: { status: status.data } }));
  if (data) res.json(data);
});

app.delete('/api/contact/:id', requireAuth, async (req, res) => {
  const data = await databaseOr503(res, () => prisma.contactMessage.delete({ where: { id: req.params.id } }));
  if (data) res.json({ ok: true });
});

app.get('/api/dashboard/summary', requireAuth, async (_req, res) => {
  const data = await databaseOr503(res, async () => {
    const [projects, services, messages, newMessages, events] = await Promise.all([
      prisma.project.count(), prisma.service.count(), prisma.contactMessage.count(), prisma.contactMessage.count({ where: { status: 'new' } }), prisma.analyticsEvent.count()
    ]);
    return { projects, services, messages, newMessages, events };
  });
  if (data) res.json(data);
});

app.post('/api/analytics/events', async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid event' });
  const data = await databaseOr503(res, () => prisma.analyticsEvent.create({ data: parsed.data }));
  if (data) res.status(201).json({ ok: true });
});

app.get('/api/analytics/summary', requireAuth, async (_req, res) => {
  const data = await databaseOr503(res, async () => {
    const [total, recent, byEvent] = await Promise.all([
      prisma.analyticsEvent.count(), prisma.analyticsEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.analyticsEvent.groupBy({ by: ['event'], _count: { event: true }, orderBy: { _count: { event: 'desc' } } })
    ]);
    return { total, recent, byEvent };
  });
  if (data) res.json(data);
});

app.use(express.static(dist, { maxAge: isProduction ? '1h' : 0 }));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(path.join(dist, 'index.html'));
  return next();
});
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const server = app.listen(PORT, () => console.log(`Gowtham portfolio server listening on port ${PORT}`));
prisma.$connect().then(() => console.log('PostgreSQL connection ready')).catch((error) => console.warn(`PostgreSQL is not connected yet: ${error.message}`));
process.on('SIGTERM', async () => { server.close(); await prisma.$disconnect(); process.exit(0); });
process.on('SIGINT', async () => { server.close(); await prisma.$disconnect(); process.exit(0); });
