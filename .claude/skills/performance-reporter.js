#!/usr/bin/env node
/**
 * performance-reporter — generate weekly/monthly performance reports
 *
 * Usage:
 *   node performance-reporter.js [options]
 *
 * Options:
 *   --api      Fetch from live API (uses BACKEND_URL env or default)
 *   --file     Path to local JSON export
 *   --period   week | month (default: week)
 *   --top      Number of top posts (default: 5)
 *   --format   text | json (default: text)
 *
 * Example:
 *   BACKEND_URL=https://kiara-planner-api.onrender.com node performance-reporter.js --api --period month
 *   node performance-reporter.js --file ./data/posts-export.json --period week --top 3
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'https://kiara-planner-api.onrender.com';

const PERIOD_DAYS = { week: 7, month: 30 };

async function fetchPosts(useApi, filePath) {
  if (useApi) {
    const res = await fetch(`${BACKEND_URL}/api/analytics`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.posts || data;
  }
  const fp = filePath || join(process.cwd(), 'data', 'posts-export.json');
  return JSON.parse(readFileSync(fp, 'utf-8'));
}

function splitByPeriod(posts, days) {
  const now = Date.now();
  const cutoff = now - days * 86400000;
  const prevCutoff = cutoff - days * 86400000;
  return {
    current: posts.filter((p) => new Date(p.created_at).getTime() >= cutoff),
    previous: posts.filter(
      (p) =>
        new Date(p.created_at).getTime() >= prevCutoff &&
        new Date(p.created_at).getTime() < cutoff
    ),
  };
}

function engagementRate(post) {
  const eng = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
  const reach = post.reach || 1;
  return (eng / reach) * 100;
}

function avgER(posts) {
  if (!posts.length) return 0;
  return posts.reduce((sum, p) => sum + engagementRate(p), 0) / posts.length;
}

function totalReach(posts) {
  return posts.reduce((sum, p) => sum + (p.reach || 0), 0);
}

function pctChange(curr, prev) {
  if (prev === 0) return curr > 0 ? '+100%' : '—';
  const delta = ((curr - prev) / prev) * 100;
  return (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%';
}

function topPosts(posts, n) {
  return [...posts].sort((a, b) => engagementRate(b) - engagementRate(a)).slice(0, n);
}

function bestPostingDay(posts) {
  const dayMap = {};
  for (const p of posts) {
    const day = new Date(p.created_at).toLocaleDateString('en-US', { weekday: 'long' });
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(engagementRate(p));
  }
  let best = { day: 'N/A', avg: 0 };
  for (const [day, rates] of Object.entries(dayMap)) {
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    if (avg > best.avg) best = { day, avg };
  }
  return best;
}

function contentBreakdown(posts) {
  const types = {};
  for (const p of posts) {
    const type = p.type || detectType(p.content || '');
    if (!types[type]) types[type] = [];
    types[type].push(engagementRate(p));
  }
  return Object.entries(types).map(([type, rates]) => ({
    type,
    count: rates.length,
    avgER: (rates.reduce((s, r) => s + r, 0) / rates.length).toFixed(1),
  }));
}

function detectType(content) {
  if (/tip|how|secret|hack/i.test(content)) return 'Tips/How-to';
  if (/new|feature|update|launch/i.test(content)) return 'Feature promo';
  if (/behind|team|office|bts/i.test(content)) return 'Behind scenes';
  return 'Motivational';
}

function formatReport(data) {
  const { period, curr, prev, top, bestDay, breakdown } = data;

  const currER = avgER(curr).toFixed(2);
  const prevER = avgER(prev).toFixed(2);
  const currReach = totalReach(curr);
  const prevReach = totalReach(prev);
  const topLikes = top[0]?.likes || 0;
  const prevTopLikes = topPosts(prev, 1)[0]?.likes || 0;

  let out = `
## Kiara Planner — Performance Report (${period})
${'='.repeat(50)}

### TL;DR
${curr.length} posts published. Avg engagement rate ${currER}% (${pctChange(+currER, +prevER)} vs last ${period}).

### Summary Snapshot
| Metric              | This ${period.padEnd(5)} | Last ${period.padEnd(5)} | Change  |
|---------------------|------------|------------|---------|
| Total Posts         | ${String(curr.length).padEnd(10)} | ${String(prev.length).padEnd(10)} | ${pctChange(curr.length, prev.length).padEnd(7)} |
| Avg Engagement Rate | ${(currER + '%').padEnd(10)} | ${(prevER + '%').padEnd(10)} | ${pctChange(+currER, +prevER).padEnd(7)} |
| Total Reach         | ${String(currReach).padEnd(10)} | ${String(prevReach).padEnd(10)} | ${pctChange(currReach, prevReach).padEnd(7)} |
| Top Post Likes      | ${String(topLikes).padEnd(10)} | ${String(prevTopLikes).padEnd(10)} | ${pctChange(topLikes, prevTopLikes).padEnd(7)} |

### Top ${top.length} Posts (by engagement rate)
${top.map((p, i) => `${i + 1}. "${(p.content || '').slice(0, 60)}…" — ${engagementRate(p).toFixed(1)}% ER, ${p.likes || 0} likes, reach ${p.reach || 0}`).join('\n')}

### Posting Pattern
- Best performing day: **${bestDay.day}** (avg ER ${bestDay.avg.toFixed(1)}%)
- Posts this ${period}: ${curr.length} (avg ${(curr.length / (period === 'week' ? 1 : 4)).toFixed(1)}/week)

### Content Type Breakdown
| Type          | Count | Avg ER |
|---------------|-------|--------|
${breakdown.map((b) => `| ${b.type.padEnd(13)} | ${String(b.count).padEnd(5)} | ${b.avgER}%   |`).join('\n')}

### Recommendations
${generateRecommendations(breakdown, bestDay, curr.length)}
`;
  return out.trim();
}

function generateRecommendations(breakdown, bestDay, postCount) {
  const sorted = [...breakdown].sort((a, b) => +b.avgER - +a.avgER);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const recs = [
    `1. Post more **${top?.type}** content — highest avg ER at ${top?.avgER}%`,
    `2. Concentrate posting on **${bestDay.day}** (best day) and test 8–9 AM window`,
    `3. Reduce or refresh **${bottom?.type}** posts — lowest ER at ${bottom?.avgER}%`,
    `4. Aim for ${postCount < 5 ? 'at least 5–7' : 'consistent'} posts per week to maintain reach`,
    `5. A/B test hook-first captions vs question-based openers this ${PERIOD_DAYS.week ? 'week' : 'month'}`,
  ];
  return recs.join('\n');
}

// --- CLI entry point ---
const argv = process.argv.slice(2);
const useApi = argv.includes('--api');
const fileArg = argv.find((_, i) => argv[i - 1] === '--file');
const period = argv.find((_, i) => argv[i - 1] === '--period') || 'week';
const topN = parseInt(argv.find((_, i) => argv[i - 1] === '--top') || '5', 10);
const fmt = argv.find((_, i) => argv[i - 1] === '--format') || 'text';

const days = PERIOD_DAYS[period] || 7;

(async () => {
  let posts;
  try {
    posts = await fetchPosts(useApi, fileArg);
  } catch (err) {
    console.error(`[performance-reporter] Failed to load data: ${err.message}`);
    process.exit(1);
  }

  const { current, previous } = splitByPeriod(posts, days);
  const top = topPosts(current, topN);
  const bestDay = bestPostingDay(current);
  const breakdown = contentBreakdown(current);

  const reportData = { period, curr: current, prev: previous, top, bestDay, breakdown };

  if (fmt === 'json') {
    console.log(JSON.stringify(reportData, null, 2));
  } else {
    console.log(formatReport(reportData));
  }
})();
