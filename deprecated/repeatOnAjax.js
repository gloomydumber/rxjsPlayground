global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("../data/krw");
const { USDT } = require("../data/usdt");
const { TICKERS } = require("../data/tickers");
const { webSocket } = require("rxjs/webSocket");
const { ajax } = require("rxjs/ajax");
const {
  map,
  mergeMap,
  switchMap,
  pluck,
  retry,
  repeat,
  tap,
  combineLatestWith,
} = require("rxjs/operators");
const { v4 } = require("uuid");
const {
  combineLatest,
  timer,
  defer,
  of,
  filter,
  share,
  Subject,
  interval,
  iif,
  merge,
} = require("rxjs");

// repeat을 ajax에 적용해도 되는가 test

const obs$ = timer(0, 2000).pipe(
  switchMap(() =>
    ajax(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
    ).pipe(
      pluck("response", 0, "basePrice"),
      retry({ delay: 1500 }), // error 시
      repeat({ delay: 1500 }) // complete 시
    )
  )
);

obs$.subscribe(console.log);
