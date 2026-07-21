// bot/commands/quotes.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../shared/db');
const { quoteEmbed, errorEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quotes')
    .setNameLocalizations({ ar: 'مقتطفات' })
    .setDescription('يرسل مقتطفاً من كلام الصحابة والعلماء')
    .setDescriptionLocalizations({ ar: 'يرسل مقتطفاً جميلاً من كلام الصحابة والعلماء' }),

  async execute(interaction) {
    const row = db.prepare('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1').get();
    if (!row) {
      await interaction.reply({ embeds: [errorEmbed('لا توجد مقتطفات في القاعدة بعد.')], ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [quoteEmbed(row)] });
  },
};
