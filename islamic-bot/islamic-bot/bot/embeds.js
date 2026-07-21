// bot/embeds.js
// دوال مساعدة لبناء Embeds جميلة وموحدة الشكل لكل أوامر البوت
const { EmbedBuilder } = require('discord.js');

const COLORS = {
  green: 0x0E6655,
  gold: 0xC9A24B,
  blue: 0x1B4F72,
  red: 0xB03A2E,
};

const DECOR = '❁ ˖ ⁺｡𓂃 ⊹ ࣪ ˖ ❁';

function baseEmbed({ color = COLORS.green, footerText = 'نسأل الله أن ينفع به' } = {}) {
  return new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: `${footerText}  •  ${DECOR}` })
    .setTimestamp();
}

function duaEmbed(row) {
  return baseEmbed({ color: COLORS.green, footerText: `التصنيف: ${row.category}` })
    .setAuthor({ name: '🤲  دعاء' })
    .setDescription(`**${row.arabic_text}**`)
    .addFields({ name: '📖 المصدر', value: row.source });
}

function adhkarEmbed(rows, category) {
  const body = rows
    .map((r, i) => `**${i + 1}.** ${r.arabic_text}${r.repeat_count > 1 ? `  *(×${r.repeat_count})*` : ''}\n> ${r.source}`)
    .join('\n\n');
  return baseEmbed({ color: COLORS.blue, footerText: 'حصن المسلم' })
    .setAuthor({ name: `🕌  أذكار ${category}` })
    .setDescription(body.slice(0, 4000));
}

function hadithEmbed(row) {
  return baseEmbed({ color: COLORS.gold, footerText: row.grade ? `الدرجة: ${row.grade}` : 'حديث شريف' })
    .setAuthor({ name: '📜  حديث شريف' })
    .setDescription(`**«${row.arabic_text}»**`)
    .addFields(
      { name: '👤 الراوي', value: row.narrator || 'غير محدد', inline: true },
      { name: '📖 المصدر', value: row.source, inline: true },
    );
}

function quoteEmbed(row) {
  return baseEmbed({ color: COLORS.green, footerText: 'من كلام السلف الصالح' })
    .setAuthor({ name: `💬  ${row.author}` })
    .setDescription(`*"${row.arabic_text}"*`)
    .addFields({ name: '📖 المصدر', value: row.source });
}

function quranAyahEmbed({ text, surahName, ayahNumber, translationText }) {
  const e = baseEmbed({ color: COLORS.gold, footerText: `سورة ${surahName} • آية ${ayahNumber}` })
    .setAuthor({ name: '📖  القرآن الكريم' })
    .setDescription(`**﴿ ${text} ﴾**`);
  if (translationText) e.addFields({ name: 'المعنى', value: translationText });
  return e;
}

function quranVideoEmbed(row) {
  return baseEmbed({ color: COLORS.red, footerText: row.reciter ? `القارئ: ${row.reciter}` : 'تلاوة قرآنية' })
    .setAuthor({ name: '🎥  فيديو تلاوة' })
    .setTitle(row.title)
    .setURL(row.youtube_url)
    .setDescription(row.surah ? `📌 السورة: ${row.surah}` : null);
}

function errorEmbed(message) {
  return baseEmbed({ color: COLORS.red, footerText: 'حدث خطأ' }).setDescription(`⚠️ ${message}`);
}

module.exports = {
  COLORS,
  baseEmbed,
  duaEmbed,
  adhkarEmbed,
  hadithEmbed,
  quoteEmbed,
  quranAyahEmbed,
  quranVideoEmbed,
  errorEmbed,
};
