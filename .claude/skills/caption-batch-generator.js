#!/usr/bin/env node
/**
 * caption-batch-generator — generate multiple social media captions
 *
 * Usage:
 *   node caption-batch-generator.js [options]
 *
 * Options (JSON via stdin or --input flag):
 *   --platform   Instagram | Facebook | TikTok  (default: Instagram)
 *   --count      Number of captions to generate (default: 5)
 *   --theme      Topic/theme string
 *   --topics     Comma-separated list of specific topics
 *
 * Example:
 *   node caption-batch-generator.js --platform Instagram --count 3 --theme "productivity tips"
 *   node caption-batch-generator.js --topics "Monday motivation,New feature,Behind the scenes"
 */

const PLATFORM_RULES = {
  Instagram: { maxChars: 150, style: 'emoji-friendly, inspirational, hook-first' },
  Facebook: { maxChars: 300, style: 'conversational, storytelling, slightly longer' },
  TikTok: { maxChars: 100, style: 'punchy opener in first 5 words, trendy, hook-first' },
};

const TEMPLATE_CAPTIONS = {
  'monday motivation': [
    'Start your week with intention — plan it, own it. ✨',
    'New week, fresh goals. What are you crushing this Monday? 💪',
    'Monday is just another chance to get it right. Let\'s go.',
  ],
  'productivity tips': [
    'The secret to productivity? Start with your 3 MITs — Most Important Tasks.',
    'Work smarter: block your time, protect your focus, own your day. ⏱️',
    'Small consistent actions beat big sporadic bursts. Every single time.',
  ],
  'new feature': [
    'Big news! 🎉 Your planning just got a major upgrade — check it out.',
    'We heard you. New feature dropping now — tap to explore.',
    'Something you asked for is finally here. Go take a look! 👀',
  ],
  'behind the scenes': [
    'Late nights and big dreams — this is what building looks like. 🌙',
    'Here\'s a peek behind the curtain at how we make it happen.',
    'The unglamorous truth: growth takes time. We\'re here for the long run.',
  ],
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1] || true;
      i++;
    }
  }
  return args;
}

function matchTemplate(theme) {
  const lower = (theme || '').toLowerCase();
  for (const key of Object.keys(TEMPLATE_CAPTIONS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return TEMPLATE_CAPTIONS[key];
    }
  }
  return null;
}

function generateCaptions({ platform = 'Instagram', count = 5, theme = '', topics = '' }) {
  const platformRule = PLATFORM_RULES[platform] || PLATFORM_RULES.Instagram;
  const topicList = topics
    ? topics.split(',').map((t) => t.trim())
    : Array(Number(count)).fill(theme || 'general');

  const results = [];

  topicList.slice(0, Number(count)).forEach((topic, i) => {
    const matched = matchTemplate(topic);
    const caption = matched
      ? matched[i % matched.length]
      : `${topic} — plan it, track it, own it. #KiaraPlanner`;

    const truncated =
      caption.length > platformRule.maxChars
        ? caption.slice(0, platformRule.maxChars - 1) + '…'
        : caption;

    results.push({
      index: i + 1,
      topic,
      caption: truncated,
      platform,
      charCount: truncated.length,
      tone: detectTone(truncated),
      hashtags: '[run hashtag-generator.js to fill]',
    });
  });

  return results;
}

function detectTone(text) {
  if (/\!|✨|💪|🎉|🔥/.test(text)) return 'inspirational';
  if (/new|update|feature|launch|drop/i.test(text)) return 'promotional';
  if (/tip|secret|how|trick|hack/i.test(text)) return 'educational';
  return 'informational';
}

function formatOutput(captions) {
  return captions
    .map(
      (c) => `--- Caption ${c.index} [${c.platform}] ---
${c.caption}
[Tone: ${c.tone}] [${c.charCount} chars]
[Hashtags: ${c.hashtags}]
`
    )
    .join('\n');
}

// --- CLI entry point ---
const args = parseArgs(process.argv);
const captions = generateCaptions({
  platform: args.platform || 'Instagram',
  count: args.count || 5,
  theme: args.theme || '',
  topics: args.topics || '',
});

console.log(formatOutput(captions));
