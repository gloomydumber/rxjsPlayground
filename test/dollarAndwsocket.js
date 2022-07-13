global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("./krw");
const { USDT } = require("./usdt");
const { webSocket } = require("rxjs/webSocket");
const { ajax } = require("rxjs/ajax");
const { map, mergeMap, pluck } = require("rxjs/operators");
const { v4 } = require("uuid");
const { combineLatest, timer } = require("rxjs");

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

const obs$ = timer(0, 2000).pipe(
  mergeMap(() =>
    ajax(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
    ).pipe(pluck("response", 0, "basePrice"))
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
