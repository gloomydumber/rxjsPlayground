global.WebSocket = require("ws");
const { KRW } = require("../test/krw");
const { USDT } = require("../test/usdt");
const { webSocket } = require("rxjs/webSocket");
const { map } = require("rxjs/operators");
const { v4 } = require("uuid");
const { merge } = require("rxjs");

const binanceQuery = USDT.join("@trade/") + "@trade";
const subjectBinance = webSocket(
  `wss://stream.binance.com:9443/ws/${binanceQuery}`
);

const upbitInit = JSON.parse(
  `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ${JSON.stringify(
    KRW
  )} }]`
);
const subjectUpbit = webSocket("wss://api.upbit.com/websocket/v1");
subjectUpbit.next(upbitInit);

const bpipe = subjectBinance.pipe(map((x) => ({ market: x.s, price: x.t })));

const upipe = subjectUpbit.pipe(
  map((x) => ({ market: x.code, price: x.trade_price }))
);

merge(bpipe, upipe).subscribe((x) => console.log(Object.assign({}, x)));

// setInterval(() => {
//   console.log("상태갱신", blank);
// }, 1000);

// subject.next({
//   message: `ping`,
// });

// ====>map===>|--------------------------------|
//             | BTC{upbit: 1000, binance: 900} | ===> 대출해줘 =>
// ====>map===>|--------------------------------|
