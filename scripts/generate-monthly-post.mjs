/**
 * Monthly AI news roundup generator.
 *
 * Runs on the 1st of each month (see .github/workflows/monthly-blog.yml) and
 * writes ONE post per locale (en, fa, ro) covering the previous month's most
 * discussed AI / software stories on Hacker News.
 *
 * Usage:
 *   node scripts/generate-monthly-post.mjs            # previous month
 *   MONTH_OVERRIDE=2026-09 node scripts/...           # a specific month
 *   node scripts/generate-monthly-post.mjs --dry-run  # list stories, no LLM
 *
 * LLM: uses OpenRouter when OPENROUTER_API_KEY is set (free models first, then
 * OPENROUTER_PAID_MODEL), otherwise Anthropic via ANTHROPIC_API_KEY.
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const LOCALES = ['en', 'fa', 'ro'];

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? '';
const OPENROUTER_MODELS = [
  ...new Set(
    [
      ...(process.env.OPENROUTER_FREE_MODELS ??
        'google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free,google/gemma-4-26b-a4b-it:free'
      ).split(','),
      process.env.OPENROUTER_PAID_MODEL ?? 'anthropic/claude-haiku-5.5',
    ]
      .map((s) => s.trim())
      .filter(Boolean),
  ),
];
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

// Whole-word match so "ai" doesn't hit "said" or "rain".
const AI_RE = new RegExp(
  '\\b(' +
    [
      'ai', 'llms?', 'gpt', 'claude', 'gemini', 'machine learning', 'deep learning',
      'neural', 'openai', 'anthropic', 'mistral', 'agents?', 'agentic', 'rag', 'embeddings?',
      'transformers?', 'diffusion', 'copilot', 'chatbots?', 'inference', 'fine-?tun\\w*',
      'open[- ]source model', 'robotics',
    ].join('|') +
    ')\\b',
  'i',
);

/** The month to cover: MONTH_OVERRIDE, or the previous calendar month (UTC). */
function targetMonth() {
  if (process.env.MONTH_OVERRIDE) {
    const [y, m] = process.env.MONTH_OVERRIDE.split('-').map(Number);
    return { year: y, month: m };
  }
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

async function fetchMonthStories({ year, month }) {
  const start = Date.UTC(year, month - 1, 1) / 1000;
  const end = Date.UTC(year, month, 1) / 1000;
  const url =
    'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=500' +
    `&numericFilters=created_at_i>=${start},created_at_i<${end},points>150`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HN search failed: ${res.status}`);
  const { hits } = await res.json();

  return hits
    .filter((h) => h.title && AI_RE.test(`${h.title} ${h.url ?? ''}`))
    .sort((a, b) => b.points - a.points)
    .slice(0, 8)
    .map((h) => ({ title: h.title, points: h.points, url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}` }));
}

function parseDelimitedResponse(raw) {
  const extract = (tag) => {
    const match = raw.match(new RegExp(`<<${tag}>>\\s*([\\s\\S]*?)\\s*(?=<<[A-Z]+>>|$)`));
    return match ? match[1].trim() : '';
  };
  const title = extract('TITLE');
  const body = extract('BODY');
  if (!title || !body) {
    throw new Error(`Missing required fields in response. Preview: ${raw.slice(0, 300)}`);
  }
  const tags = extract('TAGS');
  return {
    title,
    excerpt: extract('EXCERPT') || title,
    tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : ['AI', 'Monthly roundup'],
    body,
    readingMinutes: Math.max(3, Math.round(body.split(/\s+/).length / 200)),
  };
}

function buildPrompt(stories, locale, monthLabel) {
  const localeInstructions = {
    en: 'Write in English.',
    fa: 'Write entirely in Persian (Farsi). Use proper Persian typography and natural Farsi phrasing — not a literal translation. Write the author name as "عماد".',
    ro: 'Write entirely in Romanian. Use natural Romanian phrasing — not a literal translation.',
  };
  const list = stories.map((s, i) => `${i + 1}. "${s.title}" (${s.points} points) — ${s.url}`).join('\n');

  return `You are Emad, an AI engineer and software developer based in Baia Mare, Romania, who builds AI chatbots, websites, web apps and Android apps. Write the monthly AI news roundup for your website's blog.

Month covered: ${monthLabel}
${localeInstructions[locale]}

The most discussed AI and software stories of the month (Hacker News):
${list}

Write a blog post that:
- Has a specific, engaging title that names the month (not generic like "AI News")
- Opens with 2-3 sentences on the month's overall theme
- Groups related stories; covers the most important 5-7 in 2-4 sentences each: what happened and why it matters for small businesses and developers
- Links each story's source URL inline in markdown
- Only states facts given in the list above — do not invent numbers, quotes or details
- Ends with a short personal take from Emad (2-3 sentences)
- Is 600-900 words, clear and professional but not stiff

Output EXACTLY this delimiter format — nothing before <<TITLE>>, nothing after the body:

<<TITLE>>
Title here
<<EXCERPT>>
One-sentence summary for the blog index.
<<TAGS>>
AI, Monthly roundup
<<BODY>>
Full markdown body. No frontmatter. No code fences around this section.`;
}

async function completeOpenRouter(prompt) {
  let lastErr = '';
  for (const model of OPENROUTER_MODELS) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://emadai.dev',
        'X-Title': 'emadai.dev blog',
      },
      body: JSON.stringify({ model, max_tokens: 5000, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) {
      lastErr = `${model}: HTTP ${res.status}`;
      continue;
    }
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content?.trim();
    if (text) return text;
    lastErr = `${model}: empty response`;
  }
  throw new Error(`OpenRouter: all models failed (${lastErr})`);
}

async function completeAnthropic(prompt) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 5000,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = message.content.find((b) => b.type === 'text');
  return block ? block.text.trim() : '';
}

async function generatePost(stories, locale, monthLabel, attempts = 3) {
  const prompt = buildPrompt(stories, locale, monthLabel);
  for (let i = 1; i <= attempts; i++) {
    try {
      const raw = OPENROUTER_KEY ? await completeOpenRouter(prompt) : await completeAnthropic(prompt);
      return parseDelimitedResponse(raw);
    } catch (err) {
      if (i === attempts) throw err;
      console.error(`  [${locale}] attempt ${i} failed: ${err.message} — retrying in ${i * 10}s`);
      await new Promise((r) => setTimeout(r, i * 10_000));
    }
  }
}

function writeMd(locale, slug, post, date) {
  const dir = join('content', 'blog', locale);
  mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `${slug}.md`);
  if (existsSync(filePath)) {
    console.log(`  Skipping ${filePath} — already exists`);
    return;
  }
  const tags = post.tags.map((t) => `  - ${t}`).join('\n');
  writeFileSync(
    filePath,
    `---
title: ${JSON.stringify(post.title)}
excerpt: ${JSON.stringify(post.excerpt)}
date: "${date}"
readingMinutes: ${post.readingMinutes}
imageSeed: "blog-${slug}"
tags:
${tags}
---

${post.body.trim()}
`,
    'utf-8',
  );
  console.log(`  Wrote ${filePath}`);
}

async function main() {
  const target = targetMonth();
  const mm = String(target.month).padStart(2, '0');
  const slug = `ai-news-${target.year}-${mm}`;
  const monthLabel = new Date(Date.UTC(target.year, target.month - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  if (!DRY_RUN && LOCALES.every((l) => existsSync(join('content', 'blog', l, `${slug}.md`)))) {
    console.log(`${slug} already exists for every locale. Nothing to do.`);
    return;
  }

  console.log(`Fetching Hacker News stories for ${monthLabel}…`);
  const stories = await fetchMonthStories(target);
  console.log(`Found ${stories.length} stories:`);
  stories.forEach((s) => console.log(`  - ${s.title} (${s.points} pts)`));

  if (DRY_RUN) return;
  if (stories.length < 3) {
    console.log('Fewer than 3 relevant stories — skipping this month.');
    return;
  }
  if (!OPENROUTER_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error('Set OPENROUTER_API_KEY or ANTHROPIC_API_KEY.');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  const failed = [];
  for (const locale of LOCALES) {
    console.log(`\nGenerating ${locale} post…`);
    try {
      writeMd(locale, slug, await generatePost(stories, locale, monthLabel), today);
    } catch (err) {
      console.error(`  [${locale}] failed:`, err.message);
      failed.push(locale);
    }
  }

  if (failed.length === LOCALES.length) {
    console.error('\nAll locales failed — check the API key and credit balance.');
    process.exit(1);
  }
  if (failed.length) {
    console.error(`\nWARNING: failed locales: ${failed.join(', ')}`);
    process.exit(2);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
