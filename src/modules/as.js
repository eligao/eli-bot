'use strict';
const configs = require('../configs.js');
const asnQuery = require('../utils/bgpview/asn');
const { flag } = require('country-emoji');
const { template, fillTemplates } = require('../utils/stringTemplate');

const resp_query = template`查询目标 AS${'asn'}\n`;
const resp_asn_info = template` 名称：${'country_flag'}${'name'}\n 简介：${'description_short'}\n 流量预估：${'traffic_estimation'}\n 流量比例：${'traffic_ratio'}\n 注册局：${'rir_allocation.rir_name'}\n 分配时间：${'rir_allocation.date_allocated'}\n`;
const resp_asn_link = template`[详情](https://bgpview.io/asn/${'asn'})\n`;
const resp_footer_complete = template`======\n查询完成，耗时${'ms_elapsed'}毫秒`;
const resp_footer_pending = template`======\n查询中，已耗时${'ms_elapsed'}毫秒`;
const resp_err_invalidargs =
    '参数错误\n使用方法：`/as 自治域编号`\n 例如：`/as 6939`';
const resp_err_uncaught = '出现了未知错误\n此事件已被报告给开发者';

async function query(ctx, next) {
    let msg = null;
    try {
        ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
        let sender = ctx.message.from;
        let ms_begin = Date.now();
        if (ctx.state.args.length < 2) {
            let err = new Error();
            err.code = 'EINVALIDARGS';
            throw err;
        }
        let asn = parseInt(ctx.state.args[1]);
        // 4Byte ASN
        if ( Number.isNaN(asn) || asn > 2147483647 || asn < 0) {
            let err = new Error("Invalid ASN");
            err.code = "E_ASN_INVALID";
            throw err;
        }
        let query = {
            asn: asn,
            ms_elapsed: 0
        };
        console.log(
            `Got command from ${sender.first_name} ${sender.last_name} @${
                sender.username
            } (UID ${sender.id}): ${ctx.message.text}`
        );
        msg = await ctx.reply(
            fillTemplates(['`', resp_query, resp_footer_pending, '`'], query),
            {
                reply_to_message_id: ctx.update.message.message_id,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            }
        );
        let asnData = await asnQuery(asn);
        query = {
            ...query,
            ...asnData,
            country_flag: flag(asnData.country_code),
            ms_elapsed: Date.now() - ms_begin
        };
        await ctx.telegram.editMessageText(
            msg.chat.id,
            msg.message_id,
            null,
            fillTemplates(
                ['`', resp_query, resp_asn_info,'`',resp_asn_link,'`',resp_footer_complete, '`'],
                query
            ),
            {
                reply_to_message_id: ctx.update.message.message_id,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            }
        );
    } catch (err) {
        // Logger.forward(ctx.message)
        // Logger.error(err)
        switch (err.code) {
            case 'EINVALIDARGS':
            case 'E_ASN_INVALID':
                ctx.telegram.sendMessage(ctx.chat.id, resp_err_invalidargs, {
                    reply_to_message_id: ctx.update.message.message_id,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                break;
            default:
                ctx.telegram.forwardMessage(
                    configs.BOT_LOGGER_CHANNEL_ID,
                    ctx.message.chat.id,
                    ctx.message.message_id
                );
                ctx.telegram.sendMessage(
                    configs.BOT_LOGGER_CHANNEL_ID,
                    `Log:\n ${err.message}\n${err.stack}`
                );
                ctx.reply(resp_err_uncaught, {
                    reply_to_message_id: ctx.update.message.message_id
                });
        }
    }
}

module.exports = query;
