#!/usr/bin/env node
/**
 * trend-tracker — analyze post history and surface trending topics/hashtags
 *
 * Usage:
 *   node trend-tracker.js [options]
 *
 * Options:
 *   --api      Use live API (requires BACKEND_URL env var or default)
 *   --file     Path to local JSON export (default: data/posts-export.json)
 *   --window   Time window in days (default: 30)
 *   --top      Number of top trends to show (default: 10)
 *
 * Example:
 *   BACKEND_URL=https://kiara-planner-api.onrender.com node trend-tracker.js --api --window 30
 *   node trend-tracker.js --file ./data/posts-export.json --top 5
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'https://kiara-planner-api.onrender.com';

async function fetchPosts(useApi, filePath) {
  if (useApi) {
    const res = await fetch(`${BACKEND_URL}/api/analytics`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.posts || data;
  }

  const fp = filePath || join(process.cwd(), 'data', 'posts-export.json');
  const raw = readFileSync(fp, 'utf-8');
  return JSON.parse(raw);
}

function windowFilter(posts, windowDays) {
  const now = Date.now();
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
  const prevCutoff = cutoff - windowDays * 24 * 60 * 60 * 1000;

  const current = posts.filter((p) => new Date(p.created_at).getTime() >= cutoff);
  const previous = posts.filter(
    (p) =>
      new Date(p.created_at).getTime() >= prevCutoff &&
      new Date(p.created_at).getTime() < cutoff
  );

  return { current, previous };
}

function countHashtags(posts) {
  const counts = {};
  for (const post of posts) {
    const tags = post.hashtags || extractHashtags(post.content || '');
    for (const tag of tags) {
      const normalized = tag.toLowerCase().replace(/^#/, '');
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  }
  return counts;
}

function extractHashtags(text) {
  return (text.match(/#\w+/g) || []).map((t) => t.slice(1));
}

function computeTrends(currentCounts, prevCounts, minCount, topN) {
  const allTags = new Set([...Object.keys(currentCounts), ...Object.keys(prevCounts)]);
  const trends = [];

  for (const tag of allTags) {
    const curr = currentCounts[tag] || 0;
    const prev = prevCounts[tag] || 0;
    if (curr < minCount) continue;

    const growth = prev === 0 ? 100 : ((curr - prev) / prev) * 100;
    trends.push({ tag, curr, prev, growth: Math.round(growth * 10) / 10 });
  }

  return trends.sort((a, b) => b.growth - a.growth).slice(0, topN);
}

function formatTable(trends) {
  const header = `| Rank | Hashtag               | Now | Prev | Growth   |`;
  const sep = `|------|-----------------------|-----|------|----------|`;
  const rows = trends.map(
    (t, i) =>
      `| ${String(i + 1).padEnd(4)} | #${t.tag.padEnd(21)} | ${String(t.curr).padEnd(3)} | ${String(t.prev).padEnd(4)} | ${t.growth >= 0 ? '+' : ''}${t.growth}%`.padEnd(48) + ' |'
  );
  return [header, sep, ...rows].join('\n');
}

// --- CLI entry point ---
const args = process.argv.slice(2);
const useApi = args.includes('--api');
const fileArg = args.find((_, i) => args[i - 1] === '--file');
const windowDays = parseInt(args.find((_, i) => args[i - 1] === '--window') || '30', 10);
const topN = parseInt(args.find((_, i) => args[i - 1] === '--top') || '10', 10);
const minCount = 3;

(async () => {
  console.log(`\n## Trend Tracker — Last ${windowDays} days\n`);

  let posts;
  try {
    posts = await fetchPosts(useApi, fileArg);
  } catch (err) {
    console.error(`[trend-tracker] Failed to load data: ${err.message}`);
    console.info('Tip: run with --api (needs BACKEND_URL) or --file <path>');
    process.exit(1);
  }

  const { current, previous } = windowFilter(posts, windowDays);
  console.log(`Posts analyzed: ${current.length} (current) vs ${previous.length} (previous window)\n`);

  const currCounts = countHashtags(current);
  const prevCounts = countHashtags(previous);
  const trends = computeTrends(currCounts, prevCounts, minCount, topN);

  if (trends.length === 0) {
    console.log('No trends found. Try lowering --window or adding more data.');
    return;
  }

  console.log(formatTable(trends));

  const rising = trends.filter((t) => t.growth > 20);
  const declining = trends.filter((t) => t.growth < -20);

  if (rising.length) {
    console.log(`\n**Rising (>20% growth):** ${rising.map((t) => '#' + t.tag).join(', ')}`);
  }
  if (declining.length) {
    console.log(`**Declining (>20% drop):** ${declining.map((t) => '#' + t.tag).join(', ')}`);
  }
})();
