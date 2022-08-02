// !miniTicker@arr
//  btcusdt@miniTicker
global.WebSocket = require("ws");
const { USDT } = require("../data/usdt");
const { webSocket } = require("rxjs/webSocket");
const { map } = require("rxjs/operators");

const subject = webSocket(
  `wss://stream.binance.com:9443/ws/btcusdt@miniTicker/ethusdt@miniTicker/xrpusdt@miniTicker/eosusdt@miniTicker`
);

subject.subscribe((msg) => console.log(msg));
