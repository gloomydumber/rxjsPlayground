global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("../data/krw");
const { USDT } = require("../data/usdt");
const { webSocket } = require("rxjs/webSocket");
const { ajax } = require("rxjs/ajax");
const { map, mergeMap, pluck, retry } = require("rxjs/operators");
const { v4 } = require("uuid");
const { combineLatest, timer } = require("rxjs");

const binanceQuery = "btcusdt@trade";
const subjectBinance = webSocket(
  `wss://stream.binance.com:9443/ws/${binanceQuery}`
);

function generateUpbitUUID() {
  return JSON.parse(
    `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ["KRW-BTC"]}]`
  );
}
const subjectUpbit = webSocket("wss://api.upbit.com/websocket/v1");
subjectUpbit.next(generateUpbitUUID());

const bpipe = subjectBinance.pipe(
  map((x) => ({ market: x.s, price: Number(x.p) })),
  retry({ delay: 1500 })
);

const upipe = subjectUpbit.pipe(
  map((x) => ({ market: x.code, price: x.trade_price })),
  retry({ delay: 1500 })
);

const obs$ = timer(0, 2000).pipe(
  mergeMap(() =>
    ajax(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
    ).pipe(pluck("response", 0, "basePrice"), retry({ delay: 1500 }))
  )
);

combineLatest({ bpipe, upipe, obs$ })
  .pipe(
    map((x) =>
      Object.assign(x, {
        premium: 100 - ((x.bpipe.price * x["obs$"]) / x.upipe.price) * 100,
      })
    )
  )
  .subscribe((x) => console.log(x));
