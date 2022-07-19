global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("./krw");
const { USDT } = require("./usdt");
const { webSocket } = require("rxjs/webSocket");
const { ajax } = require("rxjs/ajax");
const {
  map,
  mergeMap,
  switchMap,
  pluck,
  retry,
  tap,
} = require("rxjs/operators");
const { v4 } = require("uuid");
const { combineLatest, timer, defer, of, filter, share } = require("rxjs");

const obs1$ = of(
  {
    ticker: "EOS",
    uPrice: 30,
    bPrice: 40,
  },
  {
    ticker: "XRP",
    uPrice: 300,
    bPrice: 400,
  },
  {
    ticker: "ETH",
    uPrice: 3000,
    bPrice: 4000,
  },
  {
    ticker: "BTC",
    uPrice: 30000,
    bPrice: 40000,
  },
  {
    ticker: "BCH",
    uPrice: 400,
    bPrice: 300,
  },
  {
    ticker: "IMX",
    uPrice: 3000,
    bPrice: 4000,
  }
).pipe(share());

// upbit, binance 구조부터 처음부터 다시 다 짜보고 실험 ㄱㄱ

const sub1 = obs1$.pipe(
  filter((x) => x.ticker === "BTC")
  //   tap(console.log)
);

const sub2 = obs1$.pipe(
  filter((x) => x.ticker !== "BTC")
  //   tap(console.log)
);

const sub3 = combineLatest({ sub1, sub2 }).pipe(tap(console.log)).subscribe();

// upbit --> filter -> XRP/KRW -------------------------------------
//                     BTC/KRW  ---                                 |
//                                 |-combineLatest---> USDT/KRW-----+--combineLatest---> {xrpkrw, xrpusdt, usdtkrw
// binance             BTC/USDT ---                                 |
//                     XRP/USDT-------------------------------------
