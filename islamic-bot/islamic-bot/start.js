const { spawn } = require('child_process');

function run(name, command, args) {
  console.log(`🚀 Starting ${name}...`);

  const process = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  process.on('close', (code) => {
    console.log(`${name} stopped with code ${code}`);
  });

  return process;
}

const website = run('Website', 'node', ['website/server.js']);
const bot = run('Discord Bot', 'node', ['bot/index.js']);

process.on('SIGINT', () => {
  website.kill();
  bot.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  website.kill();
  bot.kill();
  process.exit();
});
