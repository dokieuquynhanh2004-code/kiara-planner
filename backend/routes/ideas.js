const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

const CONTENT_TYPES = ['image', 'video', 'carousel', 'reel', 'story'];
const PLATFORMS    = ['instagram', 'tiktok', 'facebook', 'youtube', 'threads'];
const MOODS        = ['educational', 'entertaining', 'promotional', 'inspirational', 'trending'];

const parseIdea = (row) => ({
  ...row,
  platforms:   JSON.parse(row.platforms  || '[]'),
  tags:        JSON.parse(row.tags       || '[]'),
  is_favorite: Boolean(row.is_favorite)
});

// GET /api/ideas
router.get('/', auth, (req, res, next) => {
  try {
    const { mood, platform, keyword } = req.query;

    let query = 'SELECT * FROM ideas WHERE user_id = ?';
    const params = [req.user.id];

    if (mood && MOODS.includes(mood)) {
      query += ' AND mood = ?';
      params.push(mood);
    }
    if (keyword) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const kw = `%${keyword}%`;
      params.push(kw, kw);
    }

    query += ' ORDER BY is_favorite DESC, created_at DESC';
    let ideas = db.prepare(query).all(...params).map(parseIdea);

    if (platform && PLATFORMS.includes(platform)) {
      ideas = ideas.filter((idea) => idea.platforms.includes(platform));
    }

    res.json({ ideas });
  } catch (err) {
    next(err);
  }
});

// POST /api/ideas
router.post('/', auth, (req, res, next) => {
  try {
    const { title, description, content_type, platforms, mood, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Vui long nhap title y tuong' });
    }
    if (content_type && !CONTENT_TYPES.includes(content_type)) {
      return res.status(400).json({ error: `content_type phai la: ${CONTENT_TYPES.join(', ')}` });
    }
    if (mood && !MOODS.includes(mood)) {
      return res.status(400).json({ error: `mood phai la: ${MOODS.join(', ')}` });
    }

    const result = db.prepare(
      `INSERT INTO ideas (user_id, title, description, content_type, platforms, mood, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.user.id, title, description || null, content_type || null,
      JSON.stringify(platforms || []), mood || null, JSON.stringify(tags || [])
    );

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ idea: parseIdea(idea) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/ideas/:id
router.put('/:id', auth, (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM ideas WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Khong tim thay y tuong' });

    const get = (field) => (req.body[field] !== undefined ? req.body[field] : existing[field]);

    const content_type = get('content_type');
    const mood         = get('mood');

    if (content_type && !CONTENT_TYPES.includes(content_type)) {
      return res.status(400).json({ error: `content_type phai la: ${CONTENT_TYPES.join(', ')}` });
    }
    if (mood && !MOODS.includes(mood)) {
      return res.status(400).json({ error: `mood phai la: ${MOODS.join(', ')}` });
    }

    const platforms = req.body.platforms !== undefined
      ? JSON.stringify(req.body.platforms)
      : existing.platforms;
    const tags = req.body.tags !== undefined
      ? JSON.stringify(req.body.tags)
      : existing.tags;

    db.prepare(
      `UPDATE ideas SET title=?, description=?, content_type=?, platforms=?, mood=?, tags=?
       WHERE id=? AND user_id=?`
    ).run(get('title'), get('description'), content_type, platforms, mood, tags, req.params.id, req.user.id);

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
    res.json({ idea: parseIdea(idea) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ideas/:id
router.delete('/:id', auth, (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM ideas WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Khong tim thay y tuong' });

    db.prepare('DELETE FROM ideas WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Da xoa y tuong' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/ideas/:id/favorite
router.patch('/:id/favorite', auth, (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM ideas WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Khong tim thay y tuong' });

    const newFavorite = existing.is_favorite ? 0 : 1;
    db.prepare('UPDATE ideas SET is_favorite = ? WHERE id = ? AND user_id = ?').run(newFavorite, req.params.id, req.user.id);

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
    res.json({ idea: parseIdea(idea) });
  } catch (err) {
    next(err);
  }
});

// POST /api/ideas/:id/convert
router.post('/:id/convert', auth, (req, res, next) => {
  try {
    const idea = db.prepare('SELECT * FROM ideas WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!idea) return res.status(404).json({ error: 'Khong tim thay y tuong' });

    const platforms = JSON.parse(idea.platforms || '[]');
    const platform  = platforms[0] || 'instagram';
    const tags      = JSON.parse(idea.tags || '[]');

    const result = db.prepare(
      `INSERT INTO posts (user_id, title, caption, content_type, platform, status, hashtags)
       VALUES (?, ?, ?, ?, ?, 'draft', ?)`
    ).run(
      req.user.id,
      idea.title,
      idea.description || null,
      idea.content_type || 'image',
      platform,
      tags.length ? tags.map((t) => `#${t}`).join(' ') : null
    );

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ post, message: 'Da chuyen y tuong thanh bai nhap' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
