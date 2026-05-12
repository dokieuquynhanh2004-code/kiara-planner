#!/usr/bin/env node
/**
 * caption-batch-generator — generate social media captions via Groq API
 *
 * Usage:
 *   GROQ_API_KEY=gsk_... node caption-batch-generator.js [options]
 *
 *   --platform   Instagram | Facebook | TikTok  (default: Instagram)
 *   --count      Number of captions to generate (default: 5)
 *   --theme      Topic/theme string
 *   --topics     Comma-separated list of specific topics
 *
 * Example:
 *   node caption-batch-generator.js --platform Instagram --count 3 --theme "productivity tips"
 *   node caption-batch-generator.js --topics "Monday motivation,New feature,Behind the scenes"
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const PLATFORM_RULES = {
  Instagram: { maxChars: 150, style: 'emoji-friendly, inspirational, hook-first, 1-2 emojis max' },
  Facebook: { maxChars: 300, style: 'conversational, storytelling, personal tone' },
  TikTok:   { maxChars: 100, style: 'punchy opener in first 5 words, trendy, hook-first, no fluff' },
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      if (args[key] !== true) i++;
    }
  }
  return args;
}

async function generateCaptionsViaGroq({ platform, count, theme, topics }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Add it to backend/.env or export it.');
  }

  const rule = PLATFORM_RULES[platform] || PLATFORM_RULES.Instagram;
  const topicList = topics
    ? topics.split(',').map((t) => t.trim())
    : Array(Number(count)).fill(theme || 'social media planning');

  const systemPrompt = `You are a social media copywriter for Kiara Planner, a productivity and content planning app.
Generate captions that match these rules for ${platform}:
- Style: ${rule.style}
- Max length: ${rule.maxChars} characters (caption body only, no hashtags)
- Brand: friendly, motivational, modern
- App name: Kiara Planner (mention occasionally, not every caption)
Return ONLY a valid JSON array of objects. Each object: { "topic": string, "caption": string, "tone": string }
No markdown, no explanation, no code block — just the raw JSON array.`;

  const userPrompt = `Generate ${topicList.length} caption(s) for these topics on ${platform}:
${topicList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response from Groq');

  // strip markdown code fences if model wraps in ```json
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const captions = JSON.parse(cleaned);
  if (!Array.isArray(captions)) throw new Error('Response is not a JSON array');

  return captions.map((c, i) => ({
    index: i + 1,
    topic: c.topic || topicList[i],
    caption: c.caption,
    tone: c.tone || 'unknown',
    platform,
    charCount: (c.caption || '').length,
    hashtags: '[run hashtag-generator.js to fill]',
    model: MODEL,
    generatedAt: new Date().toISOString(),
  }));
}

function formatOutput(captions) {
  return captions
    .map(
      (c) =>
`--- Caption ${c.index} [${c.platform}] ---
${c.caption}
[Tone: ${c.tone}] [${c.charCount} chars] [model: ${c.model}]
[Hashtags: ${c.hashtags}]
`
    )
    .join('\n');
}

// --- CLI entry point ---
const args = parseArgs(process.argv);
const opts = {
  platform: args.platform || 'Instagram',
  count:    args.count    || 5,
  theme:    args.theme    || '',
  topics:   args.topics   || '',
};

(async () => {
  console.error(`[caption-batch-generator] Calling Groq API (${MODEL}) for ${opts.platform}...`);
  try {
    const captions = await generateCaptionsViaGroq(opts);
    console.log(formatOutput(captions));
  } catch (err) {
    console.error(`[caption-batch-generator] ERROR: ${err.message}`);
    process.exit(1);
  }
})();
