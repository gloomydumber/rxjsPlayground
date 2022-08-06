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
} = require("rxjs/operators");
const { v4 } = require("uuid");
const { combineLatest, timer, of, filter, merge, share } = require("rxjs");

const binanceQuery = USDT.join("@miniTicker/") + "@miniTicker";
const subjectBinance = webSocket(
  `wss://stream.binance.com:9443/ws/${binanceQuery}`
).pipe(repeat({ delay: 2500 }), retry({ delay: 2500 }));

function generateUpbitUUID() {
  return JSON.parse(
    `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ${JSON.stringify(
      KRW
    )} }]`
  );
}
const subjectUpbit = webSocket("wss://api.upbit.com/websocket/v1").pipe(
  tap((_) => console.log("머가들어오긴하냐"))
);
subjectUpbit.next(generateUpbitUUID());

subjectUpbit.subscribe(console.log);

// 업비트의 경우 제약 존재
