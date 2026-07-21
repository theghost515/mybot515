// bot/commands/adhkar.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../shared/db');
const { adhkarEmbed, errorEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adhkar')
    .setDescription('يرسل مجموعة أذكار (صباح / مساء / نوم ...)')
    .addStringOption((opt) =>
      opt
        .setName('category')
        .setDescription('اختر وقت الأذكار')
        .setRequired(true)
        .addChoices(
          { name: 'أذكار الصباح', value: 'الصباح' },
          { name: 'أذكار المساء', value: 'المساء' },
          { name: 'أذكار بعد الصلاة', value: 'بعد الصلاة المفروضة' },
          { name: 'أذكار النوم', value: 'النوم' },
          { name: 'دخول المسجد', value: 'دخول المسجد' },
          { name: 'دخول المنزل', value: 'دخول المنزل' },
          { name: 'الطعام', value: 'الطعام' },
        ),
    ),

  async execute(interaction) {
    const category = interaction.options.getString('category');
    const rows = db.prepare('SELECT * FROM adhkar WHERE category = ?').all(category);

    if (!rows.length) {
      await interaction.reply({
        embeds: [errorEmbed('لا توجد أذكار مسجلة لهذا التصنيف بعد.')],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [adhkarEmbed(rows, category)],
    });
  },
};
