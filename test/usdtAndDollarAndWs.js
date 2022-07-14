global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("./krw");
const { USDT } = require("./usdt");
const { webSocket } = require("rxjs/webSocket");
const { ajax } = require("rxjs/ajax");
const { map, mergeMap, switchMap, pluck, retry } = require("rxjs/operators");
const { v4 } = require("uuid");
const { combineLatest, timer, defer, of } = require("rxjs");

const binanceQuery = "btcusdt@miniTicker/ethusdt@miniTicker";
const subjectBinance = webSocket(
  `wss://stream.binance.com:9443/ws/${binanceQuery}`
);

function generateUpbitUUID() {
  return JSON.parse(
    `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ["KRW-BTC","KRW-ETH"]}]`
  );
}
const subjectUpbit = webSocket("wss://api.upbit.com/websocket/v1");
subjectUpbit.next(generateUpbitUUID());

// const bpipe = subjectBinance.pipe(
//   map((x) => ({ market: x.s, price: Number(x.c) })),
//   retry({ delay: 1500 })
// );

const bpipe = subjectBinance;

// const bipe = subjectBinance.defer((x) => {
//   return x.code === "BTCUSDT"
//     ? { market: x.s, price: Number(x.c), usdt: x.s }
//     : { market: x.s, price: Number(x.c) };
// });

// defer(() => {
//     return Math.random() > 0.5
//       ? fromEvent(document, 'click')
//       : interval(1000);

const upipe = subjectUpbit.pipe(
  map((x) => ({ market: x.code, price: x.trade_price })),
  retry({ delay: 1500 })
);

const obs$ = timer(0, 2000).pipe(
  switchMap(() =>
    ajax(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
    ).pipe(pluck("response", 0, "basePrice"), retry({ delay: 1500 }))
  )
);

// bpipe.subscribe((x) =>
//   defer(() =>
//     (x.s === "BTCUSDT"
//       ? of({ market: x.s, price: Number(x.c), usdt: x.s })
//       : of({ market: x.s, price: Number(x.c) })
//     ).subscribe(console.log)
//   )
// );

bpipe.subscribe((x) => {
  defer(() =>
    x.s === "BTCUSDT"
      ? of({ market: x.s, price: Number(x.c), usdt: Math.random() })
      : of({ market: x.s, price: Number(x.c) })
  ).subscribe(console.log);
});

// bpipe.subscribe(console.log);

// combineLatest({ bpipe, upipe, obs$ })
//   .pipe(
//     map((x) =>
//       Object.assign(x, {
//         premium: 100 - ((x.bpipe.price * x["obs$"]) / x.upipe.price) * 100,
//       })
//     )
//   )
//   .subscribe((x) => console.log(x));
