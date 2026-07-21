// bot/commands/help.js
const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, COLORS } = require('../embeds');
const { buildReportButtonRow } = require('../reportHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setNameLocalizations({ ar: 'مساعدة' })
    .setDescription('يعرض قائمة أوامر البوت وزر الإبلاغ عن مشكلة')
    .setDescriptionLocalizations({ ar: 'يعرض قائمة أوامر البوت وزر الإبلاغ عن مشكلة' }),

  async execute(interaction) {
    const embed = baseEmbed({ color: COLORS.gold, footerText: 'نسأل الله القبول' })
      .setAuthor({ name: '🌙 أوامر البوت' })
      .setDescription('فيما يلي جميع الأوامر المتاحة:')
      .addFields(
        { name: '🤲 `/dua`', value: 'إرسال دعاء من القرآن والسنة (يمكن اختيار تصنيف)' },
        { name: '🕌 `/adhkar`', value: 'إرسال أذكار الصباح / المساء / بعد الصلاة / النوم وغيرها' },
        { name: '📜 `/hadith`', value: 'إرسال حديث نبوي شريف مع الراوي والمصدر' },
        { name: '📖 `/quran`', value: 'إرسال آية قرآنية عشوائية أو محددة (سورة + آية)' },
        { name: '🎥 `/quranvideo`', value: 'إرسال فيديو تلاوة قرآنية' },
        { name: '💬 `/quotes`', value: 'إرسال مقتطف من كلام الصحابة والعلماء' },
        { name: '🕐 `/prayertimes`', value: 'مواقيت الصلاة لأي مدينة في العالم' },
        { name: '🛠️ الإبلاغ عن مشكلة', value: 'اضغط الزر أدناه لإرسال مشكلتك لفريق الدعم الفني مباشرة' },
      );

    await interaction.reply({ embeds: [embed], components: [buildReportButtonRow()] });
  },
};
