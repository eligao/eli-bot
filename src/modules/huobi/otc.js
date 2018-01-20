const { URL, URLSearchParams } = require('url');
const fetch = require('node-fetch');

const HUOBI_OTC_API_BASE = 'https://api-otc.huobi.pro/v1/otc/trade/list/public';
// ?coinId=2&tradeType=0&currentPage=1&payWay=&country=&merchant=0&online=1&range=0&currPage=1
const HUOBI_OTC_CLIENT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36';

const queryDefaultArgs = {
    coinId:1,
    tradeType:0,
    // payWay:undefined,
    // country:undefined,
    merchant:0,
    online:1,
    range:0,
    currPage:1
}

const query = async function(args){
    let apiurl = new URL(HUOBI_OTC_API_BASE);
    let newArgs =  {
        ...queryDefaultArgs,
        ...args
    };
    console.log(newArgs);
    let apiSearchParams = new URLSearchParams();
    Object.entries(newArgs).map(([k,v]) => apiSearchParams.set(k,v));
    apiurl.search = apiSearchParams.toString();
    console.log(apiurl);
    let res = await fetch(apiurl.toString(),{
        headers:{
            'User-Agent': HUOBI_OTC_CLIENT_UA
        }
    });
    let resObj = await res.json();
    return resObj;
}

module.exports = { query };