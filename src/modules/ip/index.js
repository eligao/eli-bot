'use strict';
const configs = require('../../configs');
const fetch = require('node-fetch');
const mmdb = require('maxmind');
const ipip = require('../../../lib/ipip/ipx');
const mm_city = mmdb.openSync('data/GeoLite2-City.mmdb');
const mm_asn = mmdb.openSync('data/GeoLite2-ASN.mmdb');
const {
    flag
} = require('country-emoji');
const util = require('util');
const dns = require('dns');
const LRU = require('lru-cache');
const { template, fillTemplates } = require('../../utils/stringTemplate');

// const mm_asn= mmdb.openSync('data/GeoLite2-ASN.mmdb')
// const TgLogger = require('../../utils/TgLogger')
// const Logger = new TgLogger(configs.BOT_LOGGER_CHANNEL_ID)
ipip.load('data/17monipdb.datx');

function mmdbI18nStr(elem, locales = ['en'], fallback = 'en') {
    let val = undefined;
    if (elem === undefined) return undefined;
    locales.push(fallback);
    for (let loc of locales) {
        val = elem[loc];
        if (val) break;
    }
    return val;
}

// Create a cache lasts for 6 hours
const bgpviewCache = LRU({
    max: 1000,
    maxAge: 1000 * 60 * 60 * 6
});
async function queryBgpview(addr) {
    let data = bgpviewCache.get(addr);
    if (!data) {
        // Cache miss, go query API
        let queryUrl = 'https://api.bgpview.io/ip/' + addr;
        // console.log(queryUrl)
        let query = await fetch(queryUrl);
        data = await query.json();
        bgpviewCache.set(addr, data);
    }
    let pfx = data.data.prefixes[0] || undefined;
    let return_data = {}
    if (pfx)
        return_data = {
            pfx: pfx.prefix,
            pfx_cc: flag(pfx.country_code),
            pfx_name: pfx.name,
            pfx_desc: pfx.description,
            ptr: data.data.ptr_record,
            asn: pfx.asn.asn,
            as_name: pfx.asn.name,
            as_desc: pfx.asn.description,
            as_cc: flag(pfx.asn.country_code)
        };
    return return_data;
}

function queryMMCity(addr) {
    let data = mm_city.get(addr);
    let ret_data = {
        city: mmdbI18nStr((data.city || {}).names, ['zh-CN']),
        province: mmdbI18nStr((data.subdivisions || [{}])[0].names, ['zh-CN']),
        country: mmdbI18nStr((data.country.names || {}), ['zh-CN'])
    };
    return ret_data;
}

function queryMMASN(addr) {
    let data = mm_asn.get(addr);
    let ret_data = {
        asn: data.autonomous_system_number,
        as_desc: data.autonomous_system_organization
    }
    return ret_data;
}

function queryIPIP(addr) {
    let data = ipip.findSync(addr);
    let ret_data = {
        country: data[0],
        province: data[1],
        city: data[2],
        org: data[3],
        isp: data[4],
    };
    return ret_data;
}

const dnsLookup = util.promisify(dns.lookup);
async function dnsLookupRetry(...args) {
    let dnsRes;
    const MAX_RETRY = 3;
    for(let i = 0; i< MAX_RETRY; i++){
        try{
            dnsRes = await dnsLookup(...args);
            return dnsRes;
        }
        catch (err) {
            if(err.code === 'EAI_AGAIN')
                continue;
        }
    }
    let e = new Error();
    e.code = 'EMAXRETRYEXCEEDED';
    throw e;
}

const resp_query = template `查询目标 ${'host'}\n`;
const resp_resolve = template `解析地址 ${'addr'}\n`;
const resp_geo = template ` 地址: ${'country'} - ${'province'} - ${'city'}\n`;
const resp_org = template ` 组织: ${'isp'} - ${'org'}\n`
const resp_pfx = template ` 网段: ${'pfx'}${'pfx_cc'} - ${'pfx_name'} - ${'pfx_desc'}\n`;
const resp_ptr = template ` 反解: ${'ptr'}\n`;
const resp_asn = template `[AS${'asn'} ${'as_desc'}](https://bgp.he.net/AS${'asn'})\n`;
const resp_footer_complete = template `======\n查询完成，耗时${'ms_elapsed'}毫秒`;
const resp_footer_pending = template `======\n查询中，已耗时${'ms_elapsed'}毫秒`;
const resp_err_invalidargs = '参数错误\n使用方法：`/ip 主机名或IP地址`\n 例如：`/ip www.telegram.org`';
const resp_err_nxdomain = '域名解析失败，请检查您的输入';
const resp_err_reserved = '保留段';
const resp_err_uncaught = '出现了未知错误\n此事件已被报告给开发者';

async function ip_query(ctx, next) {
    let msg, ip_family = null;
    if(ctx.state.args[0] === '/ip6')
        ip_family = 6;
    try {
        ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
        let sender = ctx.message.from;
        let ms_begin = Date.now();
        if (ctx.state.args.length < 2) {
            let err = new Error();
            err.code = 'EINVALIDARGS';
            throw err;
        }
        let host = ctx.state.args[1];
        let query = {
            host: host,
            ms_elapsed: 0
        };
        console.log(`Got command from ${sender.first_name} ${sender.last_name} @${sender.username} (UID ${sender.id}): ${ctx.message.text}`);
        msg = await ctx.reply(fillTemplates(['`', resp_query, resp_footer_pending, '`'], query), {
            reply_to_message_id: ctx.update.message.message_id,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        let dnsRes = await dnsLookupRetry(host, {family: ip_family});
        let addr = dnsRes.address;
        query.addr = addr;
        // msg = await ctx.telegram.editMessageText(msg.chat.id,msg.message_id,null,fillTemplates(['`',resp_query,resp_resolve,resp_footer_pending,'`'],query),{reply_to_message_id:ctx.update.message.message_id, parse_mode:'Markdown'})
        let resIP = {};
        if (dnsRes.family === 4) // use IPIP for ipv4
            resIP = queryIPIP(addr);
        else if (dnsRes.family === 6) // use MaxMind City db for ipv6
            resIP = queryMMCity(addr);
        //console.log('ipQuery:',resIP)
        Object.assign(query, resIP);
        query.ms_elapsed = Date.now() - ms_begin;
        // await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, null, fillTemplates(['`', resp_query, resp_resolve, resp_geo, resp_org, resp_footer_pending, '`'], query), {
        //     reply_to_message_id: ctx.update.message.message_id,
        //     parse_mode: 'Markdown',
        //     disable_web_page_preview: true
        // });
        // await ctx.reply(JSON.stringify(resIP),{reply_to_message_id:ctx.update.message.message_id})
        let resMMASN = queryMMASN(addr);
        //console.log('BGPView:',resBgpview)
        Object.assign(query, resMMASN);
        query.ms_elapsed = Date.now() - ms_begin;
        ctx.telegram.editMessageText(msg.chat.id, msg.message_id, null, fillTemplates(['`', resp_query, resp_resolve, resp_geo, resp_org, resp_pfx, resp_ptr, '`', resp_asn, '`', resp_footer_complete, '`'], query), {
            reply_to_message_id: ctx.update.message.message_id,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        // await ctx.reply(JSON.stringify(resBgpview),{reply_to_message_id:ctx.update.message.message_id})
    } catch (err) {
        // Logger.forward(ctx.message)
        // Logger.error(err)
        switch (err.code) {
            case 'EINVALIDARGS':
                ctx.telegram.sendMessage(ctx.chat.id, resp_err_invalidargs, {
                    reply_to_message_id: ctx.update.message.message_id,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                break;
            case 'EMAXRETRYEXCEEDED':
            case 'ENOTFOUND':
            case 'EAI_FAIL':
                ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, resp_err_nxdomain, {
                    reply_to_message_id: ctx.update.message.message_id,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                break;
            default:
                ctx.telegram.forwardMessage(configs.BOT_LOGGER_CHANNEL_ID, ctx.message.chat.id, ctx.message.message_id);
                ctx.telegram.sendMessage(configs.BOT_LOGGER_CHANNEL_ID, `Log:\n ${err.message}\n${err.stack}`);
                ctx.reply(resp_err_uncaught, {
                    reply_to_message_id: ctx.update.message.message_id
                });
        }
    }
}

module.exports = ip_query;