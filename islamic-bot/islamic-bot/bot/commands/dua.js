// bot/commands/dua.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../shared/db');
const { duaEmbed, errorEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dua')
    .setNameLocalizations({ ar: 'دعاء' })
    .setDescription('يرسل دعاءً من القرآن والسنة')
    .setDescriptionLocalizations({ ar: 'يرسل دعاءً جميلاً موثقاً من القرآن والسنة' })
    .addStringOption((opt) =>
      opt
        .setName('category')
        .setNameLocalizations({ ar: 'تصنيف' })
        .setDescription('اختر تصنيف الدعاء (اختياري)')
        .setRequired(false)
        .setAutocomplete(true),
    ),

  async autocomplete(interaction) {
    const rows = db.prepare('SELECT DISTINCT category FROM duas').all();
    const focused = interaction.options.getFocused().toLowerCase();
    const filtered = rows
      .map((r) => r.category)
      .filter((c) => c.toLowerCase().includes(focused))
      .slice(0, 25);
    await interaction.respond(filtered.map((c) => ({ name: c, value: c })));
  },

  async execute(interaction) {
    const category = interaction.options.getString('category');
    const row = category
      ? db.prepare('SELECT * FROM duas WHERE category = ? ORDER BY RANDOM() LIMIT 1').get(category)
      : db.prepare('SELECT * FROM duas ORDER BY RANDOM() LIMIT 1').get();

    if (!row) {
      await interaction.reply({ embeds: [errorEmbed('لا يوجد دعاء بهذا التصنيف حالياً.')], ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [duaEmbed(row)] });
  },
};
