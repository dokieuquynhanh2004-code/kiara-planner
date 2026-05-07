const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const auth = require('../middleware/auth');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const safeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// POST /api/auth/register
router.post('/register', (req, res, next) => {
  try {
    const { name, email, password, brand_name, industry } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui long dien day du name, email, password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mat khau phai co it nhat 6 ky tu' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email da duoc su dung' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, brand_name, industry) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, hashed, brand_name || null, industry || null);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ token: signToken(user), user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui long nhap email va mat khau' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Email hoac mat khau khong dung' });
    }

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res, next) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, brand_name, industry, avatar_url, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Khong tim thay nguoi dung' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', auth, (_req, res) => {
  res.json({ message: 'Dang xuat thanh cong' });
});

// PUT /api/auth/profile
router.put('/profile', auth, (req, res, next) => {
  try {
    const { name, brand_name, industry } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Ten khong duoc de trong' });
    }
    db.prepare(
      'UPDATE users SET name = ?, brand_name = ?, industry = ? WHERE id = ?'
    ).run(name.trim(), brand_name || null, industry || null, req.user.id);

    const user = db.prepare(
      'SELECT id, name, email, brand_name, industry, avatar_url, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/password
router.put('/password', auth, (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Vui long nhap mat khau cu va mat khau moi' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Mat khau moi phai co it nhat 6 ky tu' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Mat khau hien tai khong dung' });
    }

    const hashed = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);
    res.json({ message: 'Da doi mat khau thanh cong' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
