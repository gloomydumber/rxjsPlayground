const request = require("request");
const crypto = require("crypto");
const qs = require("qs");
require("dotenv").config({ path: "../.env" });
const { map, filter, toArray } = require("rxjs/operators");
const { from } = require("rxjs");

const binanceConfig = {
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.SECRET_KEY,
  HOST_URL: "https://api.binance.com",
};

const data = {
  timestamp: Date.now(),
};

const buildSign = (data, config) => {
  return crypto
    .createHmac("sha256", config.API_SECRET)
    .update(data)
    .digest("hex");
};

const dataQueryString = qs.stringify(data);
const signature = buildSign(dataQueryString, binanceConfig);
const options = {
  method: "GET",
  url:
    binanceConfig.HOST_URL +
    "/sapi/v1/margin/isolated/account" +
    "?" +
    dataQueryString +
    "&signature=" +
    signature,
  headers: {
    "X-MBX-APIKEY": binanceConfig.API_KEY,
  },
};

request(options, (error, response, body) => {
  if (error) throw new Error(error);
  const result = JSON.parse(body);
  /* vanilla-js
  // result.assets.forEach((e) => {
  //   if (e.enabled === true) {
  //     console.log(e.symbol);
  //   }
  // });
  */
  from(result.assets)
    .pipe(
      filter((x) => x.enabled === true),
      map((x) => x.symbol),
      toArray()
    )
    .subscribe(console.log);
});
