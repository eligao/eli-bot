const Telegraf = require('telegraf')
const configs = require('./configs')
const cmd_ip = require('./modules/ip')
const cmd_ping = require('./modules/ping')
const parse_args = require('./utils/parse_args')


async function main() {
  const bot = new Telegraf(configs.BOT_TOKEN, {
    telegram: {
      webhookReply: false
    },
    username: configs.BOT_USERNAME
  })
  console.log('Bot started.')
  // Set telegram webhook
  bot.telegram.setWebhook(`https://${configs.BOT_WEBHOOK_HOST}/${configs.BOT_TOKEN}`)
  console.log('Webhook set.')

  // Start https webhook
  // FYI: First non-file reply will be served via webhook response
  bot.startWebhook(`/${configs.BOT_TOKEN}`, null, configs.BOT_WEBHOOK_PORT)

  bot.command('ip', parse_args, cmd_ip)
  bot.command('ping', cmd_ping)

  //bot.on('text',(ctx => console.log(ctx)))
  bot.catch((err) => {
    console.log('Ooops', err)
  })
}

main().then(data => console.log('async main() started.')).catch(err => console.error(err))