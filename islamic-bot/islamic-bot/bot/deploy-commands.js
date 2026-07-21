// bot/deploy-commands.js
// شغّله بعد أي تعديل على الأوامر: npm run deploy-commands
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

const commands = commandFiles.map((file) => require(path.join(commandsPath, file)).data.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
      throw new Error('تأكد من ضبط DISCORD_TOKEN و CLIENT_ID في ملف .env');
    }

    console.log(`⏳ جاري تسجيل ${commands.length} أمر...`);

    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: commands,
      });
      console.log(`✅ تم تسجيل الأوامر في السيرفر ${process.env.GUILD_ID} (تظهر فوراً)`);
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log('✅ تم تسجيل الأوامر عالمياً (قد تستغرق حتى ساعة للظهور)');
    }
  } catch (err) {
    console.error('❌ فشل تسجيل الأوامر:', err);
    process.exit(1);
  }
})();
