---
name: performance-reporter
description: >
  Generate a structured weekly or monthly performance report for Kiara Planner
  social media activity. Covers top posts, engagement rate, reach trends, and
  actionable recommendations.
---

# Performance Reporter

Compile a structured performance report from Kiara Planner analytics data.

## Data source

`GET /api/analytics` or local `data/posts-export.json`

Metrics used per post:
- `likes`, `comments`, `shares` → engagement
- `reach` → impressions/reach
- `created_at` → time bucketing

## Report sections

### 1. Summary Snapshot
Key numbers for the period vs prior period:

| Metric              | This Period | Last Period | Change  |
|---------------------|-------------|-------------|---------|
| Total Posts         | 24          | 18          | +33%    |
| Avg Engagement Rate | 4.2%        | 3.1%        | +1.1pp  |
| Total Reach         | 12,400      | 8,700       | +42.5%  |
| Top Post Likes      | 312         | 198         | +57.6%  |

Engagement rate formula:
```
engagement_rate = (likes + comments + shares) / reach * 100
```

### 2. Top 5 Posts
Ranked by engagement rate:

```
1. "Start your week with intention..." — 8.9% ER, 312 likes, reach 3,500
2. "New feature: calendar sync 🔗"   — 7.2% ER, 198 likes, reach 2,750
...
```

### 3. Posting Pattern
- Best performing day: **Monday** (avg ER 5.8%)
- Best performing time: **8:00–9:00 AM**
- Posts per week average: 6

### 4. Content Type Breakdown
| Type          | Count | Avg ER |
|---------------|-------|--------|
| Motivational  | 10    | 5.2%   |
| Feature promo | 6     | 4.8%   |
| Behind scenes | 4     | 3.9%   |
| Tips/How-to   | 4     | 6.1%   |

### 5. Recommendations (ranked by impact)
1. Post Tips/How-to content more — highest ER at 6.1%
2. Shift posting window to 8–9 AM on Mon/Wed
3. Reduce behind-the-scenes posts or improve hooks
4. Test video content (currently 0 posts this period)

## Parameters

| Param    | Default | Description                         |
|----------|---------|-------------------------------------|
| `period` | `week`  | `week` or `month`                   |
| `top_n`  | `5`     | Number of top posts to highlight    |
| `format` | `text`  | `text` or `json`                    |
