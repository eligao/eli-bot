const configs = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_USERNAME: process.env.BOT_USERNAME,
    BOT_WEBHOOK_HOST: process.env.BOT_WEBHOOK_HOST,
    BOT_WEBHOOK_PORT: process.env.BOT_WEBHOOK_PORT || process.env.PORT || 3023,
    BOT_LOGGER_CHANNEL_ID: process.env.BOT_LOGGER_CHANNEL_ID,
    BOT_HUOBI_OTC_CHANNEL_ID: process.env.BOT_HUOBI_OTC_CHANNEL_ID,
    BOT_WEBHOOK_REDIRECT: process.env.BOT_WEBHOOK_REDIRECT,
};

module.exports = configs;