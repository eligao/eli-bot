const configs = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_USERNAME: process.env.BOT_USERNAME,
    BOT_WEBHOOK_HOST: process.env.BOT_WEBHOOK_HOST,
    BOT_WEBHOOK_PORT: process.env.BOT_WEBHOOK_PORT || 3023,
    BOT_LOGGER_CHANNEL_ID: process.env.BOT_LOGGER_CHANNEL_ID
}

module.exports = configs