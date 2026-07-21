// bot/commands/prayertimes.js
// ميزة إضافية مقترحة: مواقيت الصلاة لأي مدينة، عبر Aladhan API (بيانات حسابية موثوقة)
const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, errorEmbed, COLORS } = require('../embeds');

const ARABIC_NAMES = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prayertimes')
    .setNameLocalizations({ ar: 'مواقيت_الصلاة' })
    .setDescription('يرسل مواقيت الصلاة لمدينة معينة')
    .setDescriptionLocalizations({ ar: 'يرسل مواقيت الصلاة لمدينة معينة لليوم الحالي' })
    .addStringOption((opt) =>
      opt.setName('city').setNameLocalizations({ ar: 'المدينة' }).setDescription('اسم المدينة (مثال: عمّان)').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('country').setNameLocalizations({ ar: 'الدولة' }).setDescription('اسم الدولة (اختياري)'),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const city = interaction.options.getString('city');
    const country = interaction.options.getString('country') || '';

    try {
      // method=4 => طريقة أم القرى (مستخدمة على نطاق واسع في العالم العربي)
      const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || json.code !== 200) {
        throw new Error('تعذر العثور على هذه المدينة، تأكد من كتابة الاسم بشكل صحيح.');
      }

      const t = json.data.timings;
      const dateStr = json.data.date.readable;

      const lines = Object.entries(ARABIC_NAMES)
        .map(([key, ar]) => `**${ar}**: ${t[key]}`)
        .join('\n');

      const embed = baseEmbed({ color: COLORS.blue, footerText: 'المصدر: AlAdhan API - طريقة أم القرى' })
        .setAuthor({ name: `🕌 مواقيت الصلاة - ${city}${country ? ', ' + country : ''}` })
        .setDescription(`📅 ${dateStr}\n\n${lines}`);

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(err.message || 'حدث خطأ أثناء جلب مواقيت الصلاة.')] });
    }
  },
};
