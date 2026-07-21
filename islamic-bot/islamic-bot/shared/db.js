// shared/db.js
// قاعدة بيانات واحدة (SQLite) يستخدمها البوت وموقع لوحة التحكم معاً
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.join(__dirname, '..', 'data', 'bot.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS duas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- مثال: عام، سفر، كرب، طعام...
  arabic_text TEXT NOT NULL,
  source TEXT NOT NULL,             -- مصدر الدعاء (آية / حديث ودرجته)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS adhkar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- صباح / مساء / بعد الصلاة / النوم ...
  arabic_text TEXT NOT NULL,
  source TEXT NOT NULL,
  repeat_count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hadiths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  arabic_text TEXT NOT NULL,
  narrator TEXT,                    -- الصحابي الراوي
  source TEXT NOT NULL,             -- رواه البخاري ومسلم مثلاً
  grade TEXT,                       -- صحيح / حسن ...
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT NOT NULL,             -- صحابي أو عالم
  arabic_text TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quran_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  surah TEXT,                       -- اسم السورة (اختياري)
  reciter TEXT,                     -- اسم القارئ
  youtube_url TEXT NOT NULL,
  added_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  issue_text TEXT NOT NULL,
  status TEXT DEFAULT 'مفتوحة',
  created_at TEXT DEFAULT (datetime('now'))
);
`);

module.exports = db;
