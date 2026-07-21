// bot/commands/quran.js

const { SlashCommandBuilder } = require('discord.js');
const { getAyah, getRandomAyah, getRandomAyahInSurah } = require('../quranApi');
const { quranAyahEmbed, errorEmbed } = require('../embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quran')
    .setDescription('يرسل آية قرآنية (عشوائية أو محددة)')
    .addIntegerOption((opt) =>
      opt
        .setName('surah')
        .setDescription('رقم السورة (1-114)')
        .setMinValue(1)
        .setMaxValue(114),
    )
    .addIntegerOption((opt) =>
      opt
        .setName('ayah')
        .setDescription('رقم الآية داخل السورة')
        .setMinValue(1),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const surahNumber = interaction.options.getInteger('surah');
    const ayahNumber = interaction.options.getInteger('ayah');

    try {
      let data;

      if (surahNumber && ayahNumber) {
        data = await getAyah(surahNumber, ayahNumber);

        await interaction.editReply({
          embeds: [
            quranAyahEmbed({
              text: data.text,
              surahName: data.surah.name,
              ayahNumber: data.numberInSurah,
            }),
          ],
        });

      } else if (surahNumber) {
        data = await getRandomAyahInSurah(surahNumber);

        await interaction.editReply({
          embeds: [
            quranAyahEmbed({
              text: data.text,
              surahName: data.surah.name,
              ayahNumber: data.numberInSurah,
            }),
          ],
        });

      } else {
        data = await getRandomAyah();

        await interaction.editReply({
          embeds: [
            quranAyahEmbed({
              text: data.text,
              surahName: data.surah.name,
              ayahNumber: data.numberInSurah,
            }),
          ],
        });
      }

    } catch (err) {
      console.error(err);

      await interaction.editReply({
        embeds: [
          errorEmbed(err.message || 'تعذر جلب الآية حالياً، حاول لاحقاً.'),
        ],
      });
    }
  },
};
