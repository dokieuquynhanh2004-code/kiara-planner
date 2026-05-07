CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    UNIQUE NOT NULL,
  password    TEXT    NOT NULL,
  avatar_url  TEXT,
  brand_name  TEXT,
  industry    TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  title        TEXT    NOT NULL,
  caption      TEXT,
  content_type TEXT    NOT NULL CHECK(content_type IN ('image', 'video', 'carousel', 'reel', 'story')),
  platform     TEXT    NOT NULL CHECK(platform     IN ('instagram', 'tiktok', 'facebook', 'youtube', 'threads')),
  status       TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('idea', 'draft', 'scheduled', 'published')),
  scheduled_at DATETIME,
  published_at DATETIME,
  hashtags     TEXT,
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ideas (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  title        TEXT    NOT NULL,
  description  TEXT,
  content_type TEXT    CHECK(content_type IN ('image', 'video', 'carousel', 'reel', 'story')),
  platforms    TEXT    DEFAULT '[]',
  mood         TEXT    CHECK(mood IN ('educational', 'entertaining', 'promotional', 'inspirational', 'trending')),
  tags         TEXT    DEFAULT '[]',
  is_favorite  INTEGER DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
