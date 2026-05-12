---
name: trend-tracker
description: >
  Analyze post history from Kiara Planner to identify trending topics, rising
  hashtags, and content patterns over a given time window. Returns ranked trends
  with growth signals.
---

# Trend Tracker

Identify what topics and hashtags are gaining momentum in your post history.

## Data source

Reads from:
1. `GET /api/analytics` — returns aggregated post stats
2. Local export: `data/posts-export.json` (if offline)

Expected shape per post:
```json
{
  "id": 1,
  "content": "Start your week with intention...",
  "hashtags": ["productivity", "mondaymotivation"],
  "likes": 142,
  "reach": 890,
  "created_at": "2026-05-05T08:00:00Z"
}
```

## Analysis steps

1. **Group by time window** — default: last 30 days, compare vs prior 30 days
2. **Extract all hashtags** — count frequency per window
3. **Compute growth rate** — `(current_count - prev_count) / prev_count * 100`
4. **Score content themes** — cluster posts by keyword (NLP-lite: word frequency)
5. **Rank by momentum** — trending = growth rate > 20% AND absolute count > 5

## Output format

```
## Trending Topics — Last 30 Days

| Rank | Topic / Hashtag      | Count (now) | Count (prev) | Growth  |
|------|----------------------|-------------|--------------|---------|
| 1    | #productivity        | 34          | 21           | +61.9%  |
| 2    | #plannerlife         | 28          | 19           | +47.4%  |
| 3    | study tips           | 15          | 8            | +87.5%  |

**Emerging themes:** time-blocking, digital detox, exam prep

**Declining:** #throwbackthursday (-40%), general lifestyle posts (-22%)
```

## Parameters

| Param       | Default    | Description                            |
|-------------|------------|----------------------------------------|
| `window`    | `30d`      | Time window: `7d`, `30d`, `90d`        |
| `min_count` | `5`        | Minimum occurrences to include         |
| `top_n`     | `10`       | Number of trends to surface            |
