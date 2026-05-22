import { MARKETPLACE_SERVICES, formatPrice } from './marketplace-services';

const MARKETPLACE_NAMES: Record<string, { name: string; desc: string }> = {
  telegram_bot: {
    name: 'Telegram Chatbot Builder',
    desc: 'AI-powered Telegram bot for your business — configured instantly.',
  },
  travel_automation: {
    name: 'Travel Automation Bot',
    desc: 'Find the best flights and hotels for any trip — automatically.',
  },
  voice_assistant: {
    name: 'Voice Assistant Widget',
    desc: 'Add a voice assistant to your website in minutes.',
  },
  website_design: {
    name: 'Website Design',
    desc: 'Professional website design and development for your business.',
  },
  crm_automation: {
    name: 'CRM & Lead Automation',
    desc: 'Automate your lead intake, follow-ups, and CRM updates.',
  },
  social_automation: {
    name: 'Social Media Automation',
    desc: 'Automate content scheduling and engagement across platforms.',
  },
};

const marketplaceList = MARKETPLACE_SERVICES.map((s) => {
  const info = MARKETPLACE_NAMES[s.key] ?? { name: s.key, desc: '' };
  const type = s.isAutomated ? 'instant/automated' : 'custom/manual';
  return `  - ${info.name} — ${formatPrice(s.priceEurCents)} (${type}): ${info.desc} Free demo: ${s.freeDemo}.`;
}).join('\n');

export const SITE_KNOWLEDGE = `
## WEBSITE SECTIONS & CURRENT FEATURES

### Marketplace (/marketplace) — AI Services Marketplace
A self-service page where visitors pick an AI service, try a FREE demo instantly, then pay to unlock the full version. No phone call required.
Current services on the marketplace:
${marketplaceList}

How it works: 1) Sign up free  2) Fill in a short form and try the free demo  3) Pay to unlock full output + deployment guide.

### Services (/services) — Consulting Services
Professional consulting services offered by Emad:
- AI Consulting & Strategy: Tailored adoption roadmap, build vs buy analysis, risk and compliance review.
- AI Agent Design & Implementation: LangChain, CrewAI, AutoGen, and custom agents shipped to production. Includes agent architecture, tool integrations, evals & monitoring.
- Custom Software Development: Full-stack web apps, APIs, and integrations. Tech stack: Next.js / Node / Python, Postgres / Supabase, CI/CD on Vercel & AWS.
- Machine Learning Solutions: Custom model training, fine-tuning (Claude / OSS), inference deployment.
- Tech Consulting for Romanian Companies: Process digitization, AI integration, team upskilling.
- Workflow Automation: Lead intake & CRM updates, automated follow-ups & notifications, process mapping & integration.
- Job Hunting & Career Consulting in Romania: CV / LinkedIn review, Romanian market insights, interview prep.

### Pricing Packages (/services#pricing)
Three transparent packages:
- Discovery: €0 (45 min) — Free intro call to scope your needs. No commitment needed.
- Standard: €100 per engagement — Discovery + scoping, hands-on implementation, 4 weeks async support, final handover.
- Premium: €300 per month — Weekly working sessions, architecture & code reviews, dedicated Slack channel, priority response, quarterly roadmap review.

### Booking (/booking)
Book a consultation by choosing a service, a date & time, and your details. Four service types:
- AI Strategy (60-min strategic session on adopting AI)
- Agent Implementation (hands-on agent design and prototyping)
- Career & Job Consulting (CV review, interview prep, Romania market guidance)
- General Tech Consulting (architecture review, code review, technical sparring)
Engagement types: Free Discovery Call (30 min, free), Single Session (1–2 hours, custom quote), Mini Project (1–2 weeks, custom quote), Full Project (ongoing, custom quote).

### AI Consultant (/consultant)
This chat interface — an AI-powered assistant answering questions about services, careers, Romania tech market, and software development.

### Blog (/blog)
Published articles in English, Farsi (فارسی), and Romanian covering AI, tech, and the Romanian job market.

### About (/about)
Emad is an AI consultant and software developer based in Cluj-Napoca, Romania. Over a decade of experience in e-commerce, SaaS, fintech, and AI consulting.
`;
