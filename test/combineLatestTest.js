global.WebSocket = require("ws");
const { KRW } = require("./krw");
const { USDT } = require("./usdt");
const { webSocket } = require("rxjs/webSocket");
const { map, tap } = require("rxjs/operators");
const { v4 } = require("uuid");
const { merge, combineLatest } = require("rxjs");

const binanceQuery = "btcusdt@trade";
const subjectBinance = webSocket(
  `wss://stream.binance.com:9443/ws/${binanceQuery}`
);

const upbitInit = JSON.parse(
  `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ["KRW-BTC"]}]`
);
const subjectUpbit = webSocket("wss://api.upbit.com/websocket/v1");
subjectUpbit.next(upbitInit);

const bpipe = subjectBinance.pipe(
  map((x) => ({ market: x.s, price: Number(x.p) }))
);

const upipe = subjectUpbit.pipe(
  map((x) => ({ market: x.code, price: x.trade_price }))
);

// merge(bpipe, upipe).subscribe((x) => console.log(Object.assign({}, x)));

combineLatest({ bpipe, upipe })
  .pipe(
    tap((x) =>
      Object.assign(x, {
        premium: 100 - ((x.bpipe.price * 1312.5) / x.upipe.price) * 100,
      })
    )
  )
  .subscribe((x) => console.log(x));

// setInterval(() => {
//   console.log("상태갱신", blank);
// }, 1000);

// subject.next({
//   message: `ping`,
// });

// ====>map===>|--------------------------------|
//             | BTC{upbit: 1000, binance: 900} | ===> 대출해줘 =>
// ====>map===>|--------------------------------|
