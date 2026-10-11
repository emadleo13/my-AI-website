import { CONTACT_EMAIL, PRODUCT_URLS, TELEGRAM_HANDLE } from './site-config';

/**
 * Facts the chatbot may state about Emad and the business. Keep this in sync
 * with the CV (public/Abdolhamid_Bashari_CV_*.pdf), the services catalogue
 * (lib/services.ts) and the products section — if it isn't written here, the
 * assistant is told not to claim it.
 */
export const SITE_KNOWLEDGE = `
## SITE KNOWLEDGE — emadai.dev (the only source of facts about Emad (عماد) and his business)

### About Emad (/about)
- Emad (عماد) is a self-taught AI engineer and software developer based in Baia Mare, Maramureș, Romania.
- Since 2024 he has run "EMAD AI Consultant" part-time (freelance, remote), designing and building full-stack AI products for small and medium European businesses. Stack: Next.js, TypeScript, React, Flutter/Dart, Python, Node.js, PostgreSQL, Supabase, Claude API, OpenAI API, LangChain, RAG, multi-agent systems, Vercel.
- He also works full-time as a CNC machine operator and programmer at COZMIRCOM SA in Baia Mare (since December 2024).
- Earlier: insurance agent and sales team manager in Lahijan, Iran (2016–2021). Over 15 years of cross-industry work experience in total (sales management, insurance, team leadership).
- Education: B.Sc. Computer Science (in progress) at the Technical University of Cluj-Napoca; Romanian language studies at Babeș-Bolyai University (2022–2024); B.A. Financial Management, Azad Lahijan University (2017–2021). Course: AI & Python program (Pytopia.ai).
- Languages: Persian (native), English (upper-intermediate), Romanian (intermediate). Holds a Romanian work permit.
- Do NOT claim anything beyond this — e.g. no "decade of software experience", no former employers, client names or project counts that are not listed here.

### Products Emad built and runs
1. Paznic (${PRODUCT_URLS.paznic}) — security monitoring for small-business websites. Checks a site from the outside, the way a visitor's browser sees it (no access, passwords or installation needed), explains findings in plain language, and emails an alert when something changes. Free check available on the site.
2. UNIREAL (${PRODUCT_URLS.unireal}) — "Real reviews and answers about universities worldwide." Compare thousands of universities in 200+ countries: tuition, admission deadlines, English-taught programs and the 0–100 UNIREAL Score; reviews and answers verified by university email; match quiz, compare tool, scholarships. In English, Romanian and Persian. Free to browse; an optional UNIREAL Pro tier adds deadline reminders and more.
3. CNC Assist (Android app on Google Play: ${PRODUCT_URLS.cncAssist}) — speeds & feeds calculator (milling, turning, drilling), G-code analyzer (Haas, Siemens Sinumerik, ISO), 270+ CNC alarm codes for Haas, Fanuc and Sinumerik, 250+ G/M-codes explained, and an AI machining assistant that explains photos of parts, drawings and alarm screens. Free, works offline, no ads; some advanced AI features may need a subscription. English, Romanian, Persian and Arabic. Built because Emad runs CNC machines every day.
4. A team of six AI agents (Sentinel, Diagnostician, Medic, Herald, Foreman, Coordinator) that monitor websites 24/7 and send daily/weekly/monthly reports via Telegram and email.

### Services (/services) — exactly these, nothing else
1. AI Chatbot Development — custom AI chatbots and assistants: Telegram bots, WhatsApp bots, voice assistants, travel-automation bots, and social-media content bots (Instagram, LinkedIn, TikTok).
2. Website Design — business & company websites (multilingual, SEO-ready), landing pages, online stores (e-commerce), portfolio & personal websites.
3. Web & Android Apps — SaaS & web platforms (accounts, subscriptions, payments), dashboards & business tools (admin panels, CRMs, booking systems, internal tools), progressive web apps (PWA), Android apps built with Flutter and published on Google Play, and APIs & backends.
4. Resume Analysis & LinkedIn Optimization — resume review/rewrite and LinkedIn profile optimization.
Emad no longer offers workflow-automation or technology/strategy-consulting packages. If asked, say so politely and point to the closest service above (e.g. a chatbot or a custom web app/dashboard often covers the same need).

### How to start / contact (/contact)
- Every project starts with a FREE discovery call (Telegram or Google Meet), no commitment.
- Fill in the short project form on /contact, then pick a time in the calendar; a Google Meet link arrives by email (tip: check the Spam/Junk folder).
- Telegram: ${TELEGRAM_HANDLE} · Email: ${CONTACT_EMAIL} · Based in Baia Mare, Romania; works with clients remotely.

### Pricing
There is no public price list — price depends on scope, and the discovery call is free. Never quote a number, range or timeline for Emad's work, even if asked repeatedly; offer the free discovery call for a tailored quote instead.

### Blog (/blog)
Articles in English, Persian and Romanian on AI, software and the Romanian tech scene, plus a monthly AI-news roundup.
`;
