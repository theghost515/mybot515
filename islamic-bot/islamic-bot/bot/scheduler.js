// bot/scheduler.js
// نشر تلقائي دوري: أذكار / أحاديث / مقتطفات في القنوات المحددة بملف .env
const cron = require('node-cron');
const db = require('../shared/db');
const { adhkarEmbed, hadithEmbed, quoteEmbed } = require('./embeds');

const ADHKAR_CATEGORIES = ['الصباح', 'المساء', 'بعد الصلاة المفروضة', 'النوم'];

function minutesToCron(minutes) {
  const m = Math.max(1, parseInt(minutes, 10) || 180);
  if (m % 60 === 0) return `0 */${m / 60} * * *`; // كل عدد ساعات
  return `*/${m} * * * *`; // كل عدد دقائق
}

async function postAdhkar(client) {
  const channelId = process.env.ADHKAR_CHANNEL_ID;
  if (!channelId) return;
  try {
    const channel = await client.channels.fetch(channelId);
    const category = ADHKAR_CATEGORIES[Math.floor(Math.random() * ADHKAR_CATEGORIES.length)];
    const rows = db.prepare('SELECT * FROM adhkar WHERE category = ?').all(category);
    if (rows.length) await channel.send({ embeds: [adhkarEmbed(rows, category)] });
  } catch (err) {
    console.error('خطأ في نشر الأذكار التلقائي:', err.message);
  }
}

async function postHadith(client) {
  const channelId = process.env.HADITH_CHANNEL_ID;
  if (!channelId) return;
  try {
    const channel = await client.channels.fetch(channelId);
    const row = db.prepare('SELECT * FROM hadiths ORDER BY RANDOM() LIMIT 1').get();
    if (row) await channel.send({ embeds: [hadithEmbed(row)] });
  } catch (err) {
    console.error('خطأ في نشر الحديث التلقائي:', err.message);
  }
}

async function postQuote(client) {
  const channelId = process.env.QUOTES_CHANNEL_ID;
  if (!channelId) return;
  try {
    const channel = await client.channels.fetch(channelId);
    const row = db.prepare('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1').get();
    if (row) await channel.send({ embeds: [quoteEmbed(row)] });
  } catch (err) {
    console.error('خطأ في نشر المقتطف التلقائي:', err.message);
  }
}

function startScheduler(client) {
  const adhkarCron = minutesToCron(process.env.ADHKAR_INTERVAL_MINUTES);
  const hadithCron = minutesToCron(process.env.HADITH_INTERVAL_MINUTES);
  const quotesCron = minutesToCron(process.env.QUOTES_INTERVAL_MINUTES);

  if (process.env.ADHKAR_CHANNEL_ID) {
    cron.schedule(adhkarCron, () => postAdhkar(client));
    console.log(`🕌 جدولة نشر الأذكار: ${adhkarCron}`);
  }
  if (process.env.HADITH_CHANNEL_ID) {
    cron.schedule(hadithCron, () => postHadith(client));
    console.log(`📜 جدولة نشر الأحاديث: ${hadithCron}`);
  }
  if (process.env.QUOTES_CHANNEL_ID) {
    cron.schedule(quotesCron, () => postQuote(client));
    console.log(`💬 جدولة نشر المقتطفات: ${quotesCron}`);
  }
}

module.exports = { startScheduler };
