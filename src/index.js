require('dotenv').config();
const Telegraf = require('telegraf');
const http = require('http');
const configs = require('./configs');
const cmd_ip = require('./modules/ip');
const cmd_ping = require('./modules/ping');
const parse_args = require('./utils/parse_args');
const parse_reply = require('./modules/ip/parse_reply');
const huobiPoll = require('./modules/huobi/poll');
const cmd_as = require('./modules/as');
const fetch = require('node-fetch');

async function main() {
    const bot = new Telegraf(configs.BOT_TOKEN, {
        telegram: {
            webhookReply: false
        },
        username: configs.BOT_USERNAME
    });
    console.log('Bot started.');
    // Set telegram webhook
    bot.telegram.setWebhook(`https://${configs.BOT_WEBHOOK_HOST}/${configs.BOT_TOKEN}`);
    console.log('Webhook set.');

    // Start https webhook
    // FYI: First non-file reply will be served via webhook response
    let bot_callback = bot.webhookCallback(`/${configs.BOT_TOKEN}`);
    http.createServer(function(req, res) {
        let content = "";
        req.on('data', function(chunk) {
            content += chunk.toString();
        });
        req.on('end', async function(chunk) {
            let res = await fetch(configs.BOT_WEBHOOK_REDIRECT,{
                method: 'POST',
                headers: {
                    "Content-type": "application/json"
                },
                body: content
            });
        });
        bot_callback(req, res);
    }).listen(configs.BOT_WEBHOOK_PORT);

    bot.hears(/^查\s/, parse_args, parse_reply, cmd_ip);
    bot.command('ip', parse_args, parse_reply, cmd_ip);
    bot.command('ip6', parse_args, parse_reply, cmd_ip);
    bot.command('ping', cmd_ping);
    // bot.command('as', parse_args, cmd_as);
    // if(configs.BOT_HUOBI_OTC_CHANNEL_ID)
    //     huobiPoll.startSendingOTCStatus(bot,configs.BOT_HUOBI_OTC_CHANNEL_ID,60000);

    //bot.on('text',(ctx => console.log(ctx)))
    bot.catch((err) => {
        console.log('Ooops', err);
    });
}

main().then(data => console.log('async main() started.')).catch(err => console.error(err));