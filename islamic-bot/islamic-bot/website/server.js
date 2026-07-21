// website/server.js
// لوحة تحكم بسيطة لإدارة محتوى البوت (خصوصاً فيديوهات القرآن) متصلة بنفس قاعدة البيانات
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const db = require('../shared/db');

const app = express();
const PORT = process.env.WEBSITE_PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  }),
);

// ---------- حماية الدخول ----------
function requireAuth(req, res, next) {
  if (req.session.loggedIn) return next();
  return res.redirect('/login');
}

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password && password === (process.env.ADMIN_PASSWORD || 'change-me')) {
    req.session.loggedIn = true;
    return res.redirect('/');
  }
  res.render('login', { error: 'كلمة المرور غير صحيحة' });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ---------- الرئيسية / لوحة القيادة ----------
app.get('/', requireAuth, (req, res) => {
  const counts = {
    videos: db.prepare('SELECT COUNT(*) c FROM quran_videos').get().c,
    duas: db.prepare('SELECT COUNT(*) c FROM duas').get().c,
    adhkar: db.prepare('SELECT COUNT(*) c FROM adhkar').get().c,
    hadiths: db.prepare('SELECT COUNT(*) c FROM hadiths').get().c,
    quotes: db.prepare('SELECT COUNT(*) c FROM quotes').get().c,
    tickets: db.prepare("SELECT COUNT(*) c FROM tickets WHERE status = 'مفتوحة'").get().c,
  };
  res.render('dashboard', { counts });
});

// ============================================================
// فيديوهات القرآن (الميزة الأساسية المطلوبة للموقع)
// ============================================================
app.get('/videos', requireAuth, (req, res) => {
  const videos = db.prepare('SELECT * FROM quran_videos ORDER BY id DESC').all();
  res.render('videos', { videos, error: null });
});

app.post('/videos/add', requireAuth, (req, res) => {
  const { title, surah, reciter, youtube_url } = req.body;
  if (!title || !youtube_url) {
    const videos = db.prepare('SELECT * FROM quran_videos ORDER BY id DESC').all();
    return res.render('videos', { videos, error: 'العنوان ورابط اليوتيوب مطلوبان' });
  }
  db.prepare(
    'INSERT INTO quran_videos (title, surah, reciter, youtube_url, added_by) VALUES (?, ?, ?, ?, ?)',
  ).run(title, surah || null, reciter || null, youtube_url, 'لوحة التحكم');
  res.redirect('/videos');
});

app.post('/videos/:id/delete', requireAuth, (req, res) => {
  db.prepare('DELETE FROM quran_videos WHERE id = ?').run(req.params.id);
  res.redirect('/videos');
});

// ============================================================
// إدارة عامة (أدعية / أذكار / أحاديث / مقتطفات) — عرض + إضافة + حذف
// ============================================================
const TABLES = {
  duas: {
    label: 'الأدعية',
    fields: [
      { key: 'category', label: 'التصنيف' },
      { key: 'arabic_text', label: 'نص الدعاء', textarea: true },
      { key: 'source', label: 'المصدر' },
    ],
  },
  adhkar: {
    label: 'الأذكار',
    fields: [
      { key: 'category', label: 'الوقت/التصنيف' },
      { key: 'arabic_text', label: 'نص الذكر', textarea: true },
      { key: 'source', label: 'المصدر' },
      { key: 'repeat_count', label: 'عدد مرات التكرار' },
    ],
  },
  hadiths: {
    label: 'الأحاديث',
    fields: [
      { key: 'arabic_text', label: 'نص الحديث', textarea: true },
      { key: 'narrator', label: 'الراوي' },
      { key: 'source', label: 'المصدر' },
      { key: 'grade', label: 'الدرجة (صحيح/حسن..)' },
    ],
  },
  quotes: {
    label: 'مقتطفات السلف',
    fields: [
      { key: 'author', label: 'القائل' },
      { key: 'arabic_text', label: 'النص', textarea: true },
      { key: 'source', label: 'المصدر' },
    ],
  },
};

app.get('/content/:table', requireAuth, (req, res) => {
  const table = req.params.table;
  const config = TABLES[table];
  if (!config) return res.status(404).send('غير موجود');
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
  res.render('content', { table, config, rows, error: null });
});

app.post('/content/:table/add', requireAuth, (req, res) => {
  const table = req.params.table;
  const config = TABLES[table];
  if (!config) return res.status(404).send('غير موجود');

  const cols = config.fields.map((f) => f.key);
  const values = cols.map((c) => req.body[c] || null);
  const placeholders = cols.map(() => '?').join(',');
  db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`).run(...values);
  res.redirect(`/content/${table}`);
});

app.post('/content/:table/:id/delete', requireAuth, (req, res) => {
  const table = req.params.table;
  if (!TABLES[table]) return res.status(404).send('غير موجود');
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
  res.redirect(`/content/${table}`);
});

// ============================================================
// تذاكر الإبلاغ عن مشاكل (عرض فقط + تغيير الحالة)
// ============================================================
app.get('/tickets', requireAuth, (req, res) => {
  const tickets = db.prepare('SELECT * FROM tickets ORDER BY id DESC').all();
  res.render('tickets', { tickets });
});

app.post('/tickets/:id/close', requireAuth, (req, res) => {
  db.prepare("UPDATE tickets SET status = 'مغلقة' WHERE id = ?").run(req.params.id);
  res.redirect('/tickets');
});

app.listen(PORT, () => {
  console.log(`✅ لوحة التحكم تعمل على http://localhost:${PORT}`);
});
