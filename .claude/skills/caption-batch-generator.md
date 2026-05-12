---
name: caption-batch-generator
description: >
  Generate multiple social media captions in one shot. Given a list of topics
  or post ideas, outputs a ready-to-use caption for each, formatted and
  platform-appropriate.
---

# Caption Batch Generator

Generate a batch of social media captions from a list of topics or ideas.

## Usage

Call this skill with a list of post topics. For each topic, I will produce:
- A caption (platform-appropriate length)
- Suggested tone (informational / inspirational / promotional)
- A placeholder for hashtags (filled by `hashtag-generator` if chained)

## Input format

Provide topics as a numbered list or comma-separated:
```
1. Monday motivation for students
2. New feature announcement: calendar sync
3. Behind-the-scenes: team working late
```

Or specify platform + count:
```
Platform: Instagram
Count: 5
Theme: productivity tips
```

## Output format

```
--- Caption 1 ---
📅 Start your week with intention — plan it, own it. ✨
[Tone: inspirational]
[Hashtags: TBD]

--- Caption 2 ---
Big news! Calendar sync is here 🔗 Connect your schedule and never miss a beat.
[Tone: promotional]
[Hashtags: TBD]
```

## Rules

- Instagram: ≤ 150 chars for the caption body (hashtags separate)
- Facebook: up to 300 chars, more conversational
- TikTok: punchy opener in first 5 words, hook-first structure
- Never repeat the same opening word across captions in a batch
