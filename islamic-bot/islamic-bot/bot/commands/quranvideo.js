// bot/commands/quranvideo.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../shared/db');
const { quranVideoEmbed, errorEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quranvideo')
    .setDescription('يرسل فيديو تلاوة قرآنية')
    .addStringOption((opt) =>
      opt
        .setName('surah')
        .setDescription('ابحث عن سورة معينة (اختياري)'),
    ),

  async execute(interaction) {
    const surahQuery = interaction.options.getString('surah');

    const row = surahQuery
      ? db
          .prepare('SELECT * FROM quran_videos WHERE surah LIKE ? ORDER BY RANDOM() LIMIT 1')
          .get(`%${surahQuery}%`)
      : db
          .prepare('SELECT * FROM quran_videos ORDER BY RANDOM() LIMIT 1')
          .get();

    if (!row) {
      await interaction.reply({
        embeds: [
          errorEmbed('لا توجد فيديوهات مضافة بعد. يمكن إضافتها من لوحة التحكم على الموقع.'),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [quranVideoEmbed(row)],
    });
  },
};
