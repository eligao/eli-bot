const otc = require('./otc');

async function sendOTCStatus(bot, chatId){
     /*
     res.data is array of: 
    {
    "id": 97137,
    "tradeNo": "ywb7wkv4o3",
    "country": 86,
    "coinId": 2,
    "tradeType": 0,
    "merchant": 0,
    "currency": 86,
    "payMethod": "1",
    "userId": 2080145,
    "userName": "谢谢大佬们",
    "isFixed": true,
    "minTradeLimit": 10000,
    "maxTradeLimit": 200000,
    "fixedPrice": 7.15,
    "calcRate": 0,
    "price": 7.15,
    "tradeCount": 50000,
    "isOnline": true,
    "tradeMonthTimes": 133,
    "appealMonthTimes": 0,
    "appealMonthWinTimes": 0
    },
     */
    let resText = '';

    let resUSDTMakers = await otc.query({
        coinId:2,
        tradeType: 1
    });
    let resUSDTTakers = await otc.query({
        coinId:2,
        tradeType: 0
    });

    let USDTMakersTable = resUSDTMakers.data.reverse()
        .map(elem => `${elem.userName}\t${elem.price}CNY\t${elem.minTradeLimit}-${elem.maxTradeLimit}CNY\t${elem.tradeCount}USDT\t${elem.merchant==='1'?'*':''}`)
        .join('\n');
       
    let USDTTakersTable = resUSDTTakers.data
        .map(elem => `${elem.userName}\t${elem.price}CNY\t${elem.minTradeLimit}-${elem.maxTradeLimit}CNY\t${elem.tradeCount}USDT\t${elem.merchant==='1'?'*':''}`)
        .join('\n');
        resText +=  `USDT:\n`+
                    `\`${USDTMakersTable}\`\n`+
                    `[卖单](https://otc.huobi.pro/#/trade/list?coin=2&type=0)▲\n`+
                    `\`用户名\t单价\t交易范围\t可售总量\`\n`+
                    `[买单](https://otc.huobi.pro/#/trade/list?coin=2&type=1)▼\n`+
                    `\`${USDTTakersTable}\`\n`;
    bot.telegram.sendMessage(chatId, resText, {
        disable_notification: true,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
}

function startSendingOTCStatus(bot, chatId, interval = 5){
    setInterval(sendOTCStatus, interval, bot, chatId);
}

module.exports = {
    sendOTCStatus,
    startSendingOTCStatus
}