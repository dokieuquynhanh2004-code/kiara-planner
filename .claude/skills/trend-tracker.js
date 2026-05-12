#!/usr/bin/env node
/**
 * trend-tracker — analyze internal post trends + fetch external trend intelligence via Groq API
 *
 * Usage:
 *   GROQ_API_KEY=gsk_... node trend-tracker.js [options]
 *
 *   --api      Fetch internal posts from live backend (BACKEND_URL env or default)
 *   --file     Path to local JSON export (default: data/posts-export.json)
 *   --window   Time window in days (default: 30)
 *   --top      Number of top trends to show (default: 10)
 *   --niche    Content niche for Groq query (default: "content creator productivity planning")
 *   --month    Target month for Groq trend query (default: current month name)
 *   --platform Platform for Groq trend query (default: Instagram)
 *
 * Example:
 *   GROQ_API_KEY=gsk_... node trend-tracker.js --file data/posts-export.json --month "June 2026"
 *   GROQ_API_KEY=gsk_... node trend-tracker.js --api --window 30 --niche "social media planning"
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';
const BACKEND_URL  = process.env.BACKEND_URL || 'https://kiara-planner-api.onrender.com';

// ─── Internal data helpers ────────────────────────────────────────────────────

async function fetchPosts(useApi, filePath) {
  if (useApi) {
    const res = await fetch(`${BACKEND_URL}/api/analytics`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.posts || data;
  }
  const fp = filePath || join(process.cwd(), 'data', 'posts-export.json');
  return JSON.parse(readFileSync(fp, 'utf-8'));
}

function windowFilter(posts, windowDays) {
  const now = Date.now();
  const cutoff     = now - windowDays * 86400000;
  const prevCutoff = cutoff - windowDays * 86400000;
  return {
    current:  posts.filter((p) => new Date(p.created_at).getTime() >= cutoff),
    previous: posts.filter((p) => {
      const t = new Date(p.created_at).getTime();
      return t >= prevCutoff && t < cutoff;
    }),
  };
}

function countHashtags(posts) {
  const counts = {};
  for (const post of posts) {
    const tags = post.hashtags || extractHashtags(post.content || '');
    for (const tag of tags) {
      const key = tag.toLowerCase().replace(/^#/, '');
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return counts;
}

function extractHashtags(text) {
  return (text.match(/#\w+/g) || []).map((t) => t.slice(1));
}

function computeTrends(currCounts, prevCounts, minCount, topN) {
  const all = new Set([...Object.keys(currCounts), ...Object.keys(prevCounts)]);
  const trends = [];
  for (const tag of all) {
    const curr = currCounts[tag] || 0;
    const prev = prevCounts[tag] || 0;
    if (curr < minCount) continue;
    const growth = prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 1000) / 10;
    trends.push({ tag, curr, prev, growth });
  }
  return trends.sort((a, b) => b.growth - a.growth).slice(0, topN);
}

function formatInternalTable(trends) {
  const header = `| Rank | Hashtag               | Now | Prev | Growth   |`;
  const sep    = `|------|-----------------------|-----|------|----------|`;
  const rows   = trends.map((t, i) =>
    `| ${String(i + 1).padEnd(4)} | #${t.tag.padEnd(21)} | ${String(t.curr).padEnd(3)} | ${String(t.prev).padEnd(4)} | ${t.growth >= 0 ? '+' : ''}${t.growth}%`
  );
  return [header, sep, ...rows].join('\n');
}

// ─── Groq external trend intelligence ────────────────────────────────────────

async function fetchGroqTrends({ niche, month, platform }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const systemPrompt = `You are a social media trend analyst specializing in the content creator economy.
Return ONLY valid JSON — no markdown, no explanation.
Schema:
{
  "trending_hashtags": [
    { "tag": "string (no #)", "category": "broad|niche|branded", "momentum": "rising|peak|stable", "reason": "string" }
  ],
  "trending_themes": [
    { "theme": "string", "why": "string", "content_type": "string" }
  ],
  "declining_tags": ["string"],
  "platform_insight": "string",
  "best_posting_times": "string"
}
Return exactly 10 trending_hashtags, 5 trending_themes, 3 declining_tags.`;

  const userPrompt = `Analyze trending hashtags and content themes for the **${niche}** niche on **${platform}** in **${month}**.
Focus on what creators in the productivity, planning, and social media management space should be using right now.
The app is Kiara Planner — a content planning tool for creators and students.`;

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty Groq response');

  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

function formatGroqSection(groq) {
  const tagTable = [
    `| Rank | Hashtag                  | Category | Momentum | Why                           |`,
    `|------|--------------------------|----------|----------|-------------------------------|`,
    ...groq.trending_hashtags.map((t, i) =>
      `| ${String(i + 1).padEnd(4)} | #${t.tag.padEnd(24)} | ${t.category.padEnd(8)} | ${t.momentum.padEnd(8)} | ${(t.reason || '').slice(0, 29).padEnd(29)} |`
    ),
  ].join('\n');

  const themeList = groq.trending_themes
    .map((t, i) => `${i + 1}. **${t.theme}** (${t.content_type})\n   ${t.why}`)
    .join('\n');

  return `### Trending Hashtags (Groq Intelligence)
${tagTable}

### Trending Content Themes
${themeList}

### Declining Tags to Avoid
${groq.declining_tags.map((t) => `#${t}`).join(' · ')}

### Platform Insight
${groq.platform_insight}

### Best Posting Times
${groq.best_posting_times}`;
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

const argv    = process.argv.slice(2);
const useApi  = argv.includes('--api');
const fileArg = argv.find((_, i) => argv[i - 1] === '--file');
const windowDays = parseInt(argv.find((_, i) => argv[i - 1] === '--window') || '30', 10);
const topN    = parseInt(argv.find((_, i) => argv[i - 1] === '--top') || '10', 10);
const niche   = argv.find((_, i) => argv[i - 1] === '--niche')    || 'content creator productivity planning';
const month   = argv.find((_, i) => argv[i - 1] === '--month')    || 'June 2026';
const platform = argv.find((_, i) => argv[i - 1] === '--platform') || 'Instagram';

(async () => {
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log(`## Trend Tracker — ${month} | ${platform}`);
  console.log(`Generated: ${ts} | Model: ${GROQ_MODEL}\n`);

  // ── PART 1: Internal post data ──
  console.log(`### PART 1: Internal Post Analysis (last ${windowDays} days)`);
  let internalNote = '';
  try {
    const posts = await fetchPosts(useApi, fileArg);
    const { current, previous } = windowFilter(posts, windowDays);
    console.log(`Posts: ${current.length} (current window) vs ${previous.length} (previous window)\n`);

    const currCounts = countHashtags(current);
    const prevCounts = countHashtags(previous);
    const trends = computeTrends(currCounts, prevCounts, 3, topN);

    if (trends.length === 0) {
      console.log('No internal trends found (insufficient data).');
      internalNote = 'No internal data available.';
    } else {
      console.log(formatInternalTable(trends));
      const rising   = trends.filter((t) => t.growth > 20);
      const declining = trends.filter((t) => t.growth < -20);
      if (rising.length)   console.log(`\n**Rising:** ${rising.map((t) => '#' + t.tag).join(', ')}`);
      if (declining.length) console.log(`**Declining:** ${declining.map((t) => '#' + t.tag).join(', ')}`);
    }
  } catch (err) {
    console.log(`Internal data unavailable: ${err.message}`);
    internalNote = err.message;
  }

  // ── PART 2: Groq external trend intelligence ──
  console.log(`\n### PART 2: External Trend Intelligence (Groq API — ${GROQ_MODEL})`);
  console.log(`Niche: "${niche}" | Platform: ${platform} | Month: ${month}\n`);

  try {
    const groqTrends = await fetchGroqTrends({ niche, month, platform });
    console.log(formatGroqSection(groqTrends));
  } catch (err) {
    console.error(`[trend-tracker] Groq API error: ${err.message}`);
    process.exit(1);
  }
})();
