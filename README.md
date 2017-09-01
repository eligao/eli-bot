# eli-bot

## Intro
This is a simple bot for Telegram. 
It now mainly supports IP query.
More functions are coming on the way.

## Usage

1. Create a `.env` file with following parameters:
``` dotenv
# Token of the bot, ask @botfather for one.
BOT_TOKEN = ''
# The bot username, optional.
# without it the bot won't recognize @mentioned commands
BOT_USERNAME = 'whatever_bot'
# The domain where Telegram calls you with webhook when new messages come.
BOT_WEBHOOK_HOST = 'example.herokuapp.com'
# The port this bot accepts webhook, BEHIND YOUR REVERSE PROXY
BOT_WEBHOOK_PORT = 3023
# A channel id to forward your error messages/ logs.
# Remember to set the bot as an editor
BOT_LOGGER_CHANNEL_ID = -100123456789

# where you download ipip db
# you may get one at https://www.ipip.net/free_download/
IPIP_DB_DL_URL = ''
IPIP_DB_AUTH_HEAD = ''

# where you download maxmind db
MMDB_CITY_URL = 'https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz'
```
If running on heroku or other cloud platform, set your environment vars accordingly instead.

2. `yarn install && yarn start` or `npm install && npm start`

3. Knock your bot with `/ping` and see if it works.
