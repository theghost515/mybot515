// bot/reportHandler.js
// نظام "الإبلاغ عن مشكلة": زر -> نافذة إدخال -> إرسال ويب هوك لسيرفر الدعم الفني
// + إرسال رسالة خاصة (DM) للمستخدم بمشكلته + حفظها في قاعدة البيانات
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const db = require('../shared/db');
const { baseEmbed, COLORS } = require('./embeds');

const REPORT_BUTTON_ID = 'report_issue_button';
const REPORT_MODAL_ID = 'report_issue_modal';
const REPORT_INPUT_ID = 'report_issue_input';

function buildReportButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(REPORT_BUTTON_ID)
      .setLabel('🛠️ الإبلاغ عن مشكلة')
      .setStyle(ButtonStyle.Danger),
  );
}

async function handleReportButton(interaction) {
  const modal = new ModalBuilder().setCustomId(REPORT_MODAL_ID).setTitle('الإبلاغ عن مشكلة');

  const input = new TextInputBuilder()
    .setCustomId(REPORT_INPUT_ID)
    .setLabel('اشرح المشكلة التي واجهتك بالتفصيل')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('مثال: أمر /حديث لا يعمل ويظهر لي خطأ...')
    .setMinLength(10)
    .setMaxLength(1000)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function handleReportModalSubmit(interaction) {
  const issueText = interaction.fields.getTextInputValue(REPORT_INPUT_ID);
  const user = interaction.user;

  // 1) حفظ التذكرة في قاعدة البيانات
  db.prepare(
    `INSERT INTO tickets (discord_user_id, username, issue_text) VALUES (?, ?, ?)`,
  ).run(user.id, `${user.username}`, issueText);

  // 2) إرسال ويب هوك لقناة الدعم الفني
  const webhookUrl = process.env.SUPPORT_WEBHOOK_URL;
  let webhookSent = false;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'تذاكر الدعم الفني',
          embeds: [
            {
              title: '🛠️ بلاغ مشكلة جديد',
              color: COLORS.red,
              fields: [
                { name: 'المستخدم', value: `${user.tag} (\`${user.id}\`)`, inline: false },
                { name: 'السيرفر', value: interaction.guild ? interaction.guild.name : 'غير معروف', inline: false },
                { name: 'وصف المشكلة', value: issueText.slice(0, 1000), inline: false },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
      webhookSent = res.ok;
      if (!res.ok) console.error('فشل إرسال الويب هوك:', res.status, await res.text());
    } catch (err) {
      console.error('خطأ أثناء إرسال الويب هوك:', err);
    }
  } else {
    console.warn('⚠️ SUPPORT_WEBHOOK_URL غير موجود في .env — لم يتم إرسال البلاغ لسيرفر الدعم');
  }

  // 3) الرد على المستخدم داخل السيرفر (رد سريع مخفي عنه فقط)
  await interaction.reply({
    content: '✅ تم استلام بلاغك بنجاح، وسنتواصل معك قريباً عبر الخاص.',
    ephemeral: true,
  });

  // 4) إرسال رسالة خاصة (DM) للمستخدم بتفاصيل مشكلته
  try {
    const dmEmbed = baseEmbed({ color: COLORS.blue, footerText: 'فريق الدعم الفني' })
      .setAuthor({ name: '🛠️ تم استلام بلاغك' })
      .setDescription(
        `شكراً لتواصلك معنا! هذه نسخة من المشكلة التي أرسلتها:\n\n> ${issueText}\n\nسيقوم فريق الدعم الفني بمراجعتها والرد عليك في أقرب وقت ممكن، إن شاء الله.`,
      );

    const supportInvite = process.env.SUPPORT_SERVER_INVITE;
    if (supportInvite) {
      dmEmbed.addFields({ name: 'سيرفر الدعم الفني', value: supportInvite });
    }

    await user.send({ embeds: [dmEmbed] });
  } catch (err) {
    // غالباً بسبب أن الخاص مغلق عند المستخدم
    console.warn(`تعذر إرسال رسالة خاصة للمستخدم ${user.tag}:`, err.message);
    await interaction.followUp({
      content: '⚠️ تعذر إرسال رسالة خاصة لك (تأكد أن الخاص مفتوح لأعضاء السيرفر)، لكن بلاغك تم استلامه بنجاح.',
      ephemeral: true,
    });
  }

  if (!webhookSent && webhookUrl) {
    await interaction.followUp({
      content: '⚠️ حدث خلل بسيط في إرسال البلاغ لفريق الدعم، لكن تم حفظه في نظامنا وسيتم مراجعته.',
      ephemeral: true,
    });
  }
}

module.exports = {
  REPORT_BUTTON_ID,
  REPORT_MODAL_ID,
  buildReportButtonRow,
  handleReportButton,
  handleReportModalSubmit,
};
