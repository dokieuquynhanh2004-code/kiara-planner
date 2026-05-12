#!/usr/bin/env node
/**
 * hashtag-generator — calls Groq API to generate hashtags for a caption
 *
 * Usage:
 *   node hashtag-generator.js "Your caption text here" [platform]
 *   GROQ_API_KEY=xxx node hashtag-generator.js "caption" Instagram
 *
 * Output: space-separated hashtags printed to stdout
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const FALLBACK_HASHTAGS = [
  '#productivity', '#plannerlife', '#KiaraPlanner', '#goalsetting',
  '#mondaymotivation', '#studyplanner', '#timemanagement',
  '#selfimprovement', '#weeklyplanner', '#intentionalliving',
];

async function generateHashtags(caption, platform = 'Instagram') {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn('[hashtag-generator] GROQ_API_KEY not set — using fallback hashtags.');
    console.log(FALLBACK_HASHTAGS.join(' '));
    return;
  }

  const systemPrompt = `You are a social media hashtag expert.
Given a caption and platform, return ONLY a valid JSON array of hashtag strings (no # prefix).
Rules:
- Return exactly 10 hashtags
- Mix: 3 broad (>500k posts), 5 niche (10k–500k posts), 2 branded (KiaraPlanner, KiaraApp)
- No spaces inside hashtags, lowercase except proper nouns
- No explanation, no markdown — just the JSON array`;

  const userPrompt = `Caption: "${caption}"\nPlatform: ${platform}`;

  try {
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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim();

    if (!raw) throw new Error('Empty response from Groq');

    const tags = JSON.parse(raw);
    if (!Array.isArray(tags)) throw new Error('Response is not an array');

    const formatted = tags.map((t) => (t.startsWith('#') ? t : `#${t}`));
    console.log(formatted.join(' '));
  } catch (err) {
    console.error(`[hashtag-generator] Error: ${err.message}`);
    console.warn('[hashtag-generator] Falling back to default hashtags.');
    console.log(FALLBACK_HASHTAGS.join(' '));
    process.exit(1);
  }
}

// --- CLI entry point ---
const [, , captionArg, platformArg] = process.argv;

if (!captionArg) {
  console.error('Usage: node hashtag-generator.js "<caption>" [platform]');
  process.exit(1);
}

generateHashtags(captionArg, platformArg || 'Instagram');
