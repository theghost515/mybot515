// bot/commands/hadith.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../shared/db');
const { hadithEmbed, errorEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hadith')
    .setNameLocalizations({ ar: 'حديث' })
    .setDescription('يرسل حديثاً نبوياً شريفاً مع الراوي والمصدر')
    .setDescriptionLocalizations({ ar: 'يرسل حديثاً نبوياً شريفاً موثقاً مع اسم الراوي والمصدر ودرجته' }),

  async execute(interaction) {
    const row = db.prepare('SELECT * FROM hadiths ORDER BY RANDOM() LIMIT 1').get();
    if (!row) {
      await interaction.reply({ embeds: [errorEmbed('لا توجد أحاديث في القاعدة بعد.')], ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [hadithEmbed(row)] });
  },
};
