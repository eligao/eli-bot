
async function ping(ctx, next) {
    // console.log(ctx.update)
    let ms_begin = Date.now();
    let msg = await ctx.reply('`Pong`', {
        reply_to_message_id: ctx.update.message.message_id,
        parse_mode: 'Markdown'
    });
    let ms_elapsed = Date.now() - ms_begin;
    await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, `\`Pong, in ${ms_elapsed}ms.\``, {
        parse_mode: 'Markdown'
    });
}

module.exports = ping;