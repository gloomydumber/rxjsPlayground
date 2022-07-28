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
} = require("rxjs");

const binanceQuery = USDT.join("@miniTicker/") + "@miniTicker";
const subjectBinance = webSocket(
  `wss://stream.binance.com:9443/ws/${binanceQuery}`
);

function generateUpbitUUID() {
  return JSON.parse(
    `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ${JSON.stringify(
      KRW
    )} }]`
  );
}
const subjectUpbit = webSocket("wss://api.upbit.com/websocket/v1");
subjectUpbit.next(generateUpbitUUID());

const bpipe = subjectBinance.pipe(
  map((x) => ({ market: x.s, price: Number(x.c) })),
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

// combineLatest({ bpipe, upipe, obs$ })
//   .pipe(
//     map((x) =>
//       Object.assign(x, {
//         premium: 100 - ((x.bpipe.price * x["obs$"]) / x.upipe.price) * 100,
//       })
//     )
//   )
//   .subscribe((x) => console.log(x));

// bpipe.subscribe(console.log);
// upipe.subscribe(console.log);

//mergeMap 고려중
// subjectBinance.subscribe();
// subjectUpbit.subscribe();
const tickerObs$ = of(...TICKERS).pipe(
  mergeMap((x) => {
    const uItem = subjectUpbit.pipe(
      filter((y) => y.code.split("-")[1] === x),
      map((z) => ({ market: z.code, price: z.trade_price }))
    );
    const bItem = subjectBinance.pipe(
      filter((y) => y.s.slice(0, -4) === x),
      map((z) => ({ market: z.s, price: Number(z.c) }))
    );

    return combineLatest({ [`UP-${x}`]: uItem, [`BN-${x}`]: bItem });
    // combineLatest({ [`UP-${x}`]: uItem, [`BN-${x}`]: bItem }).subscribe(
    //   console.log
    // );
  })
);
tickerObs$.subscribe(console.log);
