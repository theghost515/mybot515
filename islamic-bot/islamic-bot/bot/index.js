// bot/index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { startScheduler } = require('./scheduler');
const {
  REPORT_BUTTON_ID,
  REPORT_MODAL_ID,
  handleReportButton,
  handleReportModalSubmit,
} = require('./reportHandler');
const { errorEmbed } = require('./embeds');

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ لم يتم ضبط DISCORD_TOKEN في ملف .env — انسخ .env.example إلى .env واملأه.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel], // مطلوب حتى تعمل الرسائل الخاصة (DM) بشكل صحيح
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ تم تسجيل الدخول باسم ${client.user.tag}`);
  console.log(`📌 عدد الأوامر المحمّلة: ${client.commands.size}`);
  startScheduler(client);
});

client.on('interactionCreate', async (interaction) => {
  try {
    // أوامر السلاش
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // اقتراحات الإكمال التلقائي (autocomplete)
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) await command.autocomplete(interaction);
      return;
    }

    // زر الإبلاغ عن مشكلة
    if (interaction.isButton() && interaction.customId === REPORT_BUTTON_ID) {
      await handleReportButton(interaction);
      return;
    }

    // نموذج الإبلاغ عن مشكلة بعد التعبئة
    if (interaction.isModalSubmit() && interaction.customId === REPORT_MODAL_ID) {
      await handleReportModalSubmit(interaction);
      return;
    }
  } catch (err) {
    console.error('حدث خطأ أثناء معالجة التفاعل:', err);
    const payload = { embeds: [errorEmbed('حدث خطأ غير متوقع أثناء تنفيذ الأمر.')], ephemeral: true };
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload);
      } else if (interaction.isRepliable?.()) {
        await interaction.reply(payload);
      }
    } catch (_) {
      /* تجاهل */
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
