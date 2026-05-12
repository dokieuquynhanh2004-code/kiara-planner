---
name: hashtag-generator
description: >
  Generate optimized hashtag sets for social media posts using the Groq API.
  Returns a mix of broad, niche, and branded hashtags tailored to the caption
  topic and target platform.
---

# Hashtag Generator

Generate a curated hashtag set for a social media post by calling the Groq API.

## Groq API call

```javascript
// POST https://api.groq.com/openai/v1/chat/completions
// Header: Authorization: Bearer $GROQ_API_KEY

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: `You are a social media hashtag expert. Given a caption and platform,
return ONLY a JSON array of hashtags (strings, no # prefix).
Rules:
- Return 8–12 hashtags total
- Mix: 3 broad (>500k posts), 4 niche (10k–500k), 1–2 branded (#KiaraPlanner)
- No spaces inside hashtags
- Lowercase except proper nouns`,
      },
      {
        role: 'user',
        content: `Caption: "${caption}"\nPlatform: ${platform}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  }),
});

const data = await response.json();
const hashtags = JSON.parse(data.choices[0].message.content);
// → ["productivity", "plannerlife", "mondaymotivation", "KiaraPlanner", ...]
```

## Usage

Provide a caption text and optional platform:
```
Caption: "Start your week with intention — plan it, own it. ✨"
Platform: Instagram
```

## Output format

```
Hashtags (10):
#productivity #mondaymotivation #plannerlife #studyplanner #goalsetting
#weeklyplanner #intentionalliving #plannergoals #KiaraPlanner #selfimprovement
```

## Environment variable required

Set `GROQ_API_KEY` in your `.env` file or Render environment variables.
Get a free key at https://console.groq.com

## Fallback (no API key)

If `GROQ_API_KEY` is not set, return a static set of generic hashtags and warn the user to configure the key.
