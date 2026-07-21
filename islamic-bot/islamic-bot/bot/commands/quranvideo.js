// bot/commands/quranvideo.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../shared/db');
const { quranVideoEmbed, errorEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quranvideo')
    .setNameLocalizations({ ar: 'فيديو_قرآن' })
    .setDescription('يرسل فيديو تلاوة قرآنية')
    .setDescriptionLocalizations({ ar: 'يرسل فيديو تلاوة قرآنية من القائمة المضافة في لوحة التحكم' })
    .addStringOption((opt) =>
      opt.setName('surah').setNameLocalizations({ ar: 'سورة' }).setDescription('ابحث عن سورة معينة (اختياري)'),
    ),

  async execute(interaction) {
    const surahQuery = interaction.options.getString('surah');
    const row = surahQuery
      ? db.prepare('SELECT * FROM quran_videos WHERE surah LIKE ? ORDER BY RANDOM() LIMIT 1').get(`%${surahQuery}%`)
      : db.prepare('SELECT * FROM quran_videos ORDER BY RANDOM() LIMIT 1').get();

    if (!row) {
      await interaction.reply({
        embeds: [errorEmbed('لا توجد فيديوهات مضافة بعد. يمكن إضافتها من لوحة التحكم على الموقع.')],
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({ embeds: [quranVideoEmbed(row)] });
  },
};
