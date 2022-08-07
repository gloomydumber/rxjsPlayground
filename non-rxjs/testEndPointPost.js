const request = require("request");
const crypto = require("crypto");
const qs = require("qs");
require("dotenv").config({ path: "../.env" });

const buildSign = (data, config) => {
  return crypto
    .createHmac("sha256", config.API_SECRET)
    .update(data)
    .digest("hex");
};

const binanceConfig = {
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.SECRET_KEY,
  HOST_URL: "https://api.binance.com",
};

const data = {
  asset: req.keydata.asset,
  isIsolated: "TRUE",
  symbol: req.keydata.symbol,
  amount: req.keydata.amount,
  timestamp: Date.now(),
};

const dataQueryString = qs.stringify(data);
const signature = buildSign(dataQueryString, binanceConfig);
const options = {
  method: "POST",
  url:
    binanceConfig.HOST_URL +
    "/sapi/v1/margin/loan" +
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
  console.log(body);
});
