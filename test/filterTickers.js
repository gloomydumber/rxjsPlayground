// https://api.upbit.com/v1/market/all
// https://api.binance.com/api/v3/exchangeInfo

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
  tap,
  combineLatestWith,
  retryWhen,
  distinct,
  reduce,
} = require("rxjs/operators");
const { v4 } = require("uuid");
const {
  combineLatest,
  timer,
  defer,
  of,
  from,
  filter,
  share,
  Subject,
  interval,
  Observable,
  merge,
  skip,
  take,
  toArray,
  forkJoin,
} = require("rxjs");

const upbitObs = timer(0, 2000).pipe(
  switchMap(() => ajax("https://api.upbit.com/v1/market/all")),
  pluck("response"),
  mergeMap((x) =>
    from(x).pipe(
      map((x) => x.market.split("-")[1]),
      distinct(),
      toArray()
    )
  )
  // retry({ delay: 1500 })
);

const binanceObs = timer(0, 2000).pipe(
  switchMap((_) => ajax("https://api.binance.com/api/v3/exchangeInfo")),
  pluck("response", "symbols"),
  mergeMap((x) =>
    from(x).pipe(
      map((x) => x.baseAsset),
      distinct(),
      toArray()
    )
  )

  // retry({ delay: 1500 })
);

// upbitObs.subscribe();
// binanceObs.subscribe();

// const filteredArray = array1.filter(value => array2.includes(value));
const filteredArray = combineLatest({
  upbitTicker: upbitObs,
  binanceTicker: binanceObs,
}).pipe(
  map((x) => x.upbitTicker.filter((value) => x.binanceTicker.includes(value)))
);

filteredArray.subscribe(console.log);

// merge(upbitObs, binanceObs).subscribe(console.log);
// merge(upbitObs, binanceObs).pipe(skip(1), take(1)).subscribe(console.log);

// Binance 상장 coin 정보
// status가 BREAK, TRADING
// permissions 값이 배열로 ['SPOT', 'MARGIN']
// baseAsset, quoteAsset

// 1. 일단 baseAsset만을 중복없이 추출해보자

// const test$ = from(["A", "B", "C"]).pipe();
// test$.subscribe(console.log);
