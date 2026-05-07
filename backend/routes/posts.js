const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

const CONTENT_TYPES = ['image', 'video', 'carousel', 'reel', 'story'];
const PLATFORMS    = ['instagram', 'tiktok', 'facebook', 'youtube', 'threads'];
const STATUSES     = ['idea', 'draft', 'scheduled', 'published'];

// GET /api/posts
router.get('/', auth, (req, res, next) => {
  try {
    const { platform, status, month } = req.query;
    let query = 'SELECT * FROM posts WHERE user_id = ?';
    const params = [req.user.id];

    if (platform && PLATFORMS.includes(platform)) {
      query += ' AND platform = ?';
      params.push(platform);
    }
    if (status && STATUSES.includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query += " AND strftime('%Y-%m', scheduled_at) = ?";
      params.push(month);
    }

    query += ' ORDER BY scheduled_at ASC, created_at DESC';
    const posts = db.prepare(query).all(...params);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id
router.get('/:id', auth, (req, res, next) => {
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!post) return res.status(404).json({ error: 'Khong tim thay bai dang' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts
router.post('/', auth, (req, res, next) => {
  try {
    const { title, caption, content_type, platform, status, scheduled_at, hashtags, notes } = req.body;

    if (!title || !content_type || !platform) {
      return res.status(400).json({ error: 'Thieu title, content_type hoac platform' });
    }
    if (!CONTENT_TYPES.includes(content_type)) {
      return res.status(400).json({ error: `content_type phai la: ${CONTENT_TYPES.join(', ')}` });
    }
    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: `platform phai la: ${PLATFORMS.join(', ')}` });
    }

    const postStatus = status || 'draft';
    if (!STATUSES.includes(postStatus)) {
      return res.status(400).json({ error: `status phai la: ${STATUSES.join(', ')}` });
    }

    const result = db.prepare(
      `INSERT INTO posts (user_id, title, caption, content_type, platform, status, scheduled_at, hashtags, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, caption || null, content_type, platform, postStatus, scheduled_at || null, hashtags || null, notes || null);

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

// PUT /api/posts/:id
router.put('/:id', auth, (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Khong tim thay bai dang' });

    const get = (field) => (req.body[field] !== undefined ? req.body[field] : existing[field]);

    const content_type = get('content_type');
    const platform     = get('platform');
    const status       = get('status');

    if (!CONTENT_TYPES.includes(content_type)) {
      return res.status(400).json({ error: `content_type phai la: ${CONTENT_TYPES.join(', ')}` });
    }
    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: `platform phai la: ${PLATFORMS.join(', ')}` });
    }
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status phai la: ${STATUSES.join(', ')}` });
    }

    db.prepare(
      `UPDATE posts
       SET title = ?, caption = ?, content_type = ?, platform = ?, status = ?,
           scheduled_at = ?, published_at = ?, hashtags = ?, notes = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
    ).run(
      get('title'), get('caption'), content_type, platform, status,
      get('scheduled_at'), get('published_at'), get('hashtags'), get('notes'),
      req.params.id, req.user.id
    );

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM posts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Khong tim thay bai dang' });

    db.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Da xoa bai dang' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/posts/:id/status
router.patch('/:id/status', auth, (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !STATUSES.includes(status)) {
      return res.status(400).json({ error: `status phai la: ${STATUSES.join(', ')}` });
    }

    const existing = db.prepare('SELECT id FROM posts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Khong tim thay bai dang' });

    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    db.prepare(
      `UPDATE posts
       SET status = ?, published_at = COALESCE(?, published_at), updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
    ).run(status, publishedAt, req.params.id, req.user.id);

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
