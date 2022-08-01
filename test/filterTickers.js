// https://api.upbit.com/v1/market/all
// https://api.binance.com/api/v3/exchangeInfo

global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("./krw");
const { USDT } = require("./usdt");
const { TICKERS } = require("./tickers");
const { webSocket } = require("rxjs/webSocket");
const { ajax } = require("rxjs/ajax");
const {
  map,
  mergeMap,
  switchMap,
  pluck,
  retry,
  tap,
  combineLatestWith,
  retryWhen,
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
  Observable,
} = require("rxjs");

const upbitObs = timer(0, 2000).pipe(
  switchMap(() => ajax("https://api.upbit.com/v1/market/all")),
  pluck("response"),
  retry({ delay: 1500 })
);

const binanceObs = timer(0, 2000).pipe(
  switchMap(() => ajax("https://api.binance.com/api/v3/exchangeInfo")),
  pluck("response"),
  retry({ delay: 1500 })
);

// upbitObs.subscribe(console.log);
binanceObs.subscribe(console.log);
