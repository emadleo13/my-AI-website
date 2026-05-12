/**
 * Daily AI news blog post generator.
 * Fetches top AI/programming stories from HackerNews, writes a post with Claude,
 * and saves .md files for en, fa, and ro locales.
 *
 * Usage: node scripts/generate-daily-post.mjs
 * Requires: ANTHROPIC_API_KEY env var
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'machine learning', 'deep learning',
  'neural', 'openai', 'anthropic', 'mistral', 'agent', 'rag', 'embedding',
  'transformer', 'diffusion', 'programming', 'developer', 'software', 'coding',
  'typescript', 'python', 'rust', 'golang', 'nextjs', 'react', 'vercel',
  'github', 'open source', 'startup', 'funding', 'robotics', 'automation',
];

async function fetchHNStories() {
  const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const ids = await res.json();
  const top100 = ids.slice(0, 100);

  const stories = await Promise.all(
    top100.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        .then((r) => r.json())
        .catch(() => null),
    ),
  );

  return stories
    .filter((s) => s && s.type === 'story' && s.title && s.score > 50)
    .filter((s) => {
      const text = (s.title + ' ' + (s.url ?? '')).toLowerCase();
      return AI_KEYWORDS.some((kw) => text.includes(kw));
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

async function generatePost(stories, locale) {
  const storySummaries = stories
    .map((s, i) => `${i + 1}. "${s.title}" (${s.score} points) — ${s.url ?? 'news.ycombinator.com'}`)
    .join('\n');

  const today = new Date().toISOString().split('T')[0];

  const localeInstructions = {
    en: 'Write in English.',
    fa: 'Write entirely in Persian (Farsi). Use proper Persian typography and natural Farsi phrasing — not a literal translation.',
    ro: 'Write entirely in Romanian. Use natural Romanian phrasing — not a literal translation.',
  };

  const prompt = `You are Emad, an AI consultant based in Cluj-Napoca, Romania. Write a blog post for your consulting website about today's top AI and programming news.

Today's date: ${today}
${localeInstructions[locale]}

Top stories from the community today:
${storySummaries}

Write a blog post that:
- Has an engaging, specific title (not generic like "Today's AI News")
- Opens with 1-2 sentences framing why these stories matter
- Covers each story in 2-4 sentences: what happened, why it matters to developers or companies adopting AI
- Ends with a brief personal take from Emad's perspective (1-2 sentences)
- Uses clear, professional but not stiff language
- Is 400-600 words total

Output ONLY a JSON object with this exact shape:
{
  "title": "...",
  "excerpt": "One sentence summary for the blog index.",
  "readingMinutes": 3,
  "tags": ["AI", "Programming"],
  "body": "Full markdown body here (no frontmatter, just the content starting after the title)"
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in Claude response: ${raw.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

function slugFromDate(date) {
  return `ai-news-${date}`;
}

function writeMd(locale, slug, post, date) {
  const dir = join('content', 'blog', locale);
  mkdirSync(dir, { recursive: true });

  const filePath = join(dir, `${slug}.md`);
  if (existsSync(filePath)) {
    console.log(`  Skipping ${filePath} — already exists`);
    return;
  }

  const tags = (post.tags ?? ['AI', 'Programming']).map((t) => `  - ${t}`).join('\n');
  const content = `---
title: ${JSON.stringify(post.title)}
excerpt: ${JSON.stringify(post.excerpt)}
date: "${date}"
readingMinutes: ${post.readingMinutes ?? 3}
imageSeed: "blog-${slug}"
tags:
${tags}
---

${post.body.trim()}
`;

  writeFileSync(filePath, content, 'utf-8');
  console.log(`  Wrote ${filePath}`);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  const slug = slugFromDate(today);

  console.log(`Fetching HackerNews stories for ${today}…`);
  const stories = await fetchHNStories();

  if (stories.length === 0) {
    console.log('No relevant stories found today. Skipping.');
    process.exit(0);
  }

  console.log(`Found ${stories.length} stories:`);
  stories.forEach((s) => console.log(`  - ${s.title} (${s.score} pts)`));

  let successCount = 0;
  for (const locale of ['en', 'fa', 'ro']) {
    console.log(`\nGenerating ${locale} post…`);
    try {
      const post = await generatePost(stories, locale);
      writeMd(locale, slug, post, today);
      successCount++;
    } catch (err) {
      console.error(`  Failed for ${locale}:`, err.message);
    }
  }

  if (successCount === 0) {
    console.error('\nAll locales failed — check ANTHROPIC_API_KEY and credit balance.');
    process.exit(1);
  }

  console.log(`\nDone. ${successCount}/3 locales generated.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
