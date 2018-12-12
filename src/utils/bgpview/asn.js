"use strict";
const fetch = require("node-fetch");
const LRU = require("lru-cache");
const BGPVIEW_API_ASN = "https://api.bgpview.io/asn/";

// Request: GET https://api.bgpview.io/asn/as_number

/*
Example response:

Response: 200

Content-Type:application/json

Body:
{
    status: "ok",
    status_message: "Query was successful",
    data: {
        asn: 61138,
        name: "ZAPPIE-HOST-AS",
        description_short: "Zappie Host LLC",
        description_full: [
            "Zappie Host LLC"
        ],
        country_code: "GB",
        website: "https://zappiehost.com/",
        email_contacts: [
            "abuse@zappiehost.com",
            "admin@zappiehost.com",
            "noc@zappiehost.com"
        ],
        abuse_contacts: [
            "abuse@zappiehost.com"
        ],
        looking_glass: "https://zappiehost.com/network",
        traffic_estimation: "5-10Gbps",
        traffic_ratio: "Mostly Outbound",
        owner_address: [
            "16192 Coastal HWY",
            "DE 19958",
            "Lewes",
            "UNITED STATES"
        ],
        rir_allocation: {
            rir_name: "RIPE",
            country_code: "GB",
            date_allocated: "2015-03-04 00:00:00"
        },
        date_updated: "2016-02-08 19:42:45"
    },
    @meta: {
        time_zone: "UTC",
        api_version: 1,
        execution_time: "5.51 ms"
    }
} 

*/

const asnCache = LRU({
  max: 1000,
  maxAge: 1000 * 60 * 60 * 6
});

async function query(asn) {
  let iasn = parseInt(asn);
  // 4Byte ASN
  if (Number.isNaN(iasn) || iasn > 2147483647 || iasn < 0) {
    let err = new Error("Invalid ASN");
    err.code = "E_ASN_INVALID";
    throw err;
  }
  let data = asnCache.get(iasn);
  if (!data) {
    let res = await fetch(BGPVIEW_API_ASN + asn);
    if (res.status !== 200) {
      let err = new Error(
        resData.status_message || "Invalid response with code" + res.status
      );
      err.code = "E_ASN_QUERY";
    }
    let resData = await res.json();
    if (resData.status === "ok" && resData.data) data = resData.data;
    else {
      let err = new Error(resData.status_message || "Error querying data");
      err.code = "E_ASN_QUERY";
    }
  }
  return data;
}

module.exports = query;
