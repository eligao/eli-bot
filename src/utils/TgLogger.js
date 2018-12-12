const { Telegram } = require("telegraf");

class TgLogger {
  constructor(chatId) {
    this.chatId = chatId;
  }

  log(data, ...args) {
    let logData = [data, ...args];
    console.log(logData);
    for (let val of logData) {
      if (val instanceof Error)
        Telegram.sendMessage(
          this.chatId,
          `Log:\n ${logData.message}\n${logData.stack}`,
          {
            disable_notification: true
          }
        );
      else
        Telegram.sendMessage(this.chatId, `Log:\n ${JSON.stringify(logData)}`, {
          disable_notification: true
        });
    }
  }

  error(data, ...args) {
    let logData = [data, ...args];
    console.error(logData);
    for (let val of logData) {
      if (val instanceof Error)
        Telegram.sendMessage(
          this.chatId,
          `Log:\n ${logData.message}\n${logData.stack}`,
          {
            disable_notification: false
          }
        );
      else
        Telegram.sendMessage(this.chatId, `Log:\n ${JSON.stringify(logData)}`, {
          disable_notification: false
        });
    }
  }

  forward(message) {
    Telegram.forwardMessage(
      this.chatId,
      message.chat.chatId,
      message.message_id
    );
  }
}

module.exports = TgLogger;
