const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// GET /api/analytics/summary
router.get('/summary', auth, (req, res, next) => {
  try {
    const byStatus = db.prepare(
      'SELECT status, COUNT(*) AS count FROM posts WHERE user_id = ? GROUP BY status'
    ).all(req.user.id);

    const byPlatform = db.prepare(
      'SELECT platform, COUNT(*) AS count FROM posts WHERE user_id = ? GROUP BY platform'
    ).all(req.user.id);

    const totalIdeas    = db.prepare('SELECT COUNT(*) AS count FROM ideas WHERE user_id = ?').get(req.user.id);
    const favoriteIdeas = db.prepare('SELECT COUNT(*) AS count FROM ideas WHERE user_id = ? AND is_favorite = 1').get(req.user.id);

    const statusMap   = { idea: 0, draft: 0, scheduled: 0, published: 0 };
    const platformMap = { instagram: 0, tiktok: 0, facebook: 0, youtube: 0, threads: 0 };

    byStatus.forEach(({ status, count })     => { statusMap[status]     = count; });
    byPlatform.forEach(({ platform, count }) => { platformMap[platform] = count; });

    res.json({
      posts: {
        total:       Object.values(statusMap).reduce((a, b) => a + b, 0),
        by_status:   statusMap,
        by_platform: platformMap
      },
      ideas: {
        total:     totalIdeas.count,
        favorites: favoriteIdeas.count
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/heatmap
router.get('/heatmap', auth, (req, res, next) => {
  try {
    const { month } = req.query;
    const targetMonth = (month && /^\d{4}-\d{2}$/.test(month))
      ? month
      : new Date().toISOString().slice(0, 7);

    const rows = db.prepare(
      `SELECT strftime('%d', scheduled_at) AS day, COUNT(*) AS count
       FROM posts
       WHERE user_id = ? AND strftime('%Y-%m', scheduled_at) = ?
       GROUP BY day`
    ).all(req.user.id, targetMonth);

    const heatmap = {};
    rows.forEach(({ day, count }) => { heatmap[parseInt(day, 10)] = count; });

    res.json({ month: targetMonth, heatmap });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
