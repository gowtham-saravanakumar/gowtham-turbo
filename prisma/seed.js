import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  ['Technical SEO', 'Crawl · Index · Core Web Vitals', 'Crawl analysis, indexation, internal linking, structured data and technical diagnostics.'],
  ['On-Page SEO', 'Intent · Relevance · Structure', 'Titles, descriptions, headings and page-level search intent optimisation.'],
  ['Keyword Research', 'Demand · Gaps · Priority', 'Prioritised keyword maps, clusters, competitive gaps and opportunity validation.'],
  ['Content Strategy', 'Architecture · Briefs · Topics', 'Useful content systems for technical buyers, long sales cycles and specialist markets.'],
  ['Link Building', 'Outreach · Authority · Relevance', 'Targeted editorial outreach built around relevance and topical authority.'],
  ['Search Analytics', 'GSC · GA4 · Insights', 'Search Console and GA4 analysis that turns movement into actionable next steps.'],
  ['Local SEO', 'GBP · Maps · Local intent', 'Google Business Profile, citations and location-focused content systems.'],
  ['B2B / B2C / D2C SEO', 'Products · Buyers · Expertise', 'Search strategy for manufacturing, engineering and technical product environments.']
];

const projects = [
  {
    name: 'Knowledge & Entity SEO', type: 'Wikipedia / Research',
    body: 'Factual, search-aware knowledge content built around long-tail intent, clean hierarchy and entity clarity.',
    challenge: 'Explain technical and scientific topics clearly for humans and search systems.',
    approach: 'Research-first writing, descriptive headings and precise entity relationships.',
    result: '40+ published articles across knowledge-led and search-focused topics.',
    url: 'https://en.wikipedia.org/wiki/Heat_exchanger', tech: ['Research', 'Entity SEO', 'Content Writing']
  },
  {
    name: 'SEO-First Web Experiences', type: 'Frontend / Technical SEO',
    body: 'Hand-coded pages that connect design, semantic structure and search fundamentals.',
    challenge: 'Create fast, legible pages without burying search fundamentals.',
    approach: 'Semantic HTML, heading hierarchy, metadata, canonicals and performance-aware CSS.',
    result: 'Clean frontend foundations designed for usability and technical SEO review.',
    url: 'https://gowtham-saravanakumar.github.io/', tech: ['HTML / CSS', 'Technical SEO', 'Performance']
  },
  {
    name: 'Search Content Systems', type: 'B2B / B2C / D2C Strategy',
    body: 'Content architecture for manufacturing and specialist markets, built around real buyer intent.',
    challenge: 'Translate complex products into useful search experiences without losing technical detail.',
    approach: 'Intent mapping, category hierarchy, supporting guides, internal links and schema.',
    result: 'A clearer organic growth foundation for businesses with limited search visibility.',
    url: '#contact', tech: ['Intent Research', 'Schema', 'Content Strategy']
  }
];

const tools = [
  ['Google Search Console', 'Query segmentation, indexation and search performance diagnostics.'],
  ['Google Analytics 4', 'Understand acquisition, engagement and conversion events.'],
  ['Ahrefs', 'Keyword research, backlink analysis and competitive gap discovery.'],
  ['Semrush', 'Market research, site audits and opportunity prioritisation.'],
  ['Screaming Frog', 'Technical crawling, redirects, metadata and internal linking checks.'],
  ['PageSpeed Insights', 'Core Web Vitals and practical page experience improvements.']
];

const skills = [
  ['Technical SEO', 'Crawlability, indexation, canonicals and structured data.'],
  ['On-Page SEO', 'Titles, headings and intent alignment for relevant pages.'],
  ['Local SEO', 'Google Business Profile, local intent and location content.'],
  ['Intent Research', 'Keyword clusters, competitive gaps and buyer journeys.'],
  ['Content Strategy', 'Connected product, category and informational content.'],
  ['Entity Writing', 'Research-led writing with clear topics and relationships.'],
  ['Search Console', 'Query segmentation, CTR analysis and search diagnostics.'],
  ['GA4', 'Acquisition, engagement and conversion event analysis.'],
  ['HTML / CSS', 'Semantic, accessible and performance-conscious pages.'],
  ['Schema', 'Structured data and entity relationships.'],
  ['Core Web Vitals', 'PageSpeed improvements and practical page experience work.'],
  ['Looker Studio', 'Reporting that connects observations with next steps.']
];

const experience = [
  { period: '2023 — PRESENT', organisation: 'Independent Practice', role: 'SEO Specialist & Digital Growth Strategist', summary: 'Direct strategy and hands-on implementation for B2B, manufacturing and niche businesses.', bullets: ['Technical audits and prioritised roadmaps', 'Search intent, content architecture and internal linking', 'Search Console, GA4 and reporting workflows'] },
  { period: 'ONGOING', organisation: 'Medium / Knowledge Publishing', role: 'SEO Writer & Researcher', summary: 'Research-led articles that make complex topics useful to readers and legible to search systems.', bullets: ['40+ articles published', 'Entity clarity and descriptive information structure'] }
];

const achievements = [
  ['SEO EXPERIENCE', '3+ YEARS', 'Independent technical and content-led search work.'],
  ['CLIENTS SERVED', '15+', 'Direct project work across specialist markets.'],
  ['ARTICLES PUBLISHED', '40+', 'Research-led search and knowledge writing.']
];

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'change-this-password';
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash, name: 'Gowtham Saravanakumar' } });
  await prisma.profile.upsert({
    where: { id: 'profile-main' },
    update: {},
    create: { id: 'profile-main', name: 'Gowtham Saravanakumar', headline: 'SEO Specialist & Digital Growth Strategist', bio: 'Independent SEO specialist helping B2B, manufacturing and niche businesses turn search visibility into qualified organic growth.', email: 'iamgowthamsaravanakumar@gmail.com', phone: '+91 866 801 4466', linkedin: 'https://www.linkedin.com/in/gowtham-now/', medium: 'https://imgowtham.medium.com/', twitter: 'https://x.com/Gowtham__Now' }
  });
  for (let i = 0; i < services.length; i += 1) {
    const [name, tagline, description] = services[i];
    const existing = await prisma.service.findFirst({ where: { name } });
    if (existing) await prisma.service.update({ where: { id: existing.id }, data: { tagline, description, sortOrder: i } });
    else await prisma.service.create({ data: { name, tagline, description, sortOrder: i } });
  }
  for (let i = 0; i < projects.length; i += 1) {
    const project = projects[i];
    const existing = await prisma.project.findFirst({ where: { name: project.name } });
    if (existing) await prisma.project.update({ where: { id: existing.id }, data: { ...project, sortOrder: i, tech: project.tech } });
    else await prisma.project.create({ data: { ...project, sortOrder: i, tech: project.tech } });
  }
  for (let i = 0; i < tools.length; i += 1) {
    const [name, purpose] = tools[i];
    const existing = await prisma.tool.findFirst({ where: { name } });
    if (existing) await prisma.tool.update({ where: { id: existing.id }, data: { purpose, sortOrder: i } });
    else await prisma.tool.create({ data: { name, purpose, sortOrder: i } });
  }
  for (let i = 0; i < skills.length; i += 1) {
    const [name, description] = skills[i];
    const existing = await prisma.skill.findFirst({ where: { name } });
    if (existing) await prisma.skill.update({ where: { id: existing.id }, data: { description, sortOrder: i } });
    else await prisma.skill.create({ data: { name, description, sortOrder: i } });
  }
  for (let i = 0; i < experience.length; i += 1) {
    const item = experience[i];
    const existing = await prisma.experience.findFirst({ where: { organisation: item.organisation, role: item.role } });
    if (existing) await prisma.experience.update({ where: { id: existing.id }, data: { ...item, sortOrder: i } });
    else await prisma.experience.create({ data: { ...item, sortOrder: i } });
  }
  for (let i = 0; i < achievements.length; i += 1) {
    const [label, value, description] = achievements[i];
    const existing = await prisma.achievement.findFirst({ where: { label } });
    if (existing) await prisma.achievement.update({ where: { id: existing.id }, data: { value, description, sortOrder: i } });
    else await prisma.achievement.create({ data: { label, value, description, sortOrder: i } });
  }
  await prisma.siteSettings.upsert({ where: { id: 'settings-main' }, update: {}, create: { id: 'settings-main' } });
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
