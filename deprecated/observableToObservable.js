global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("../test/krw");
const { USDT } = require("../test/usdt");
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

const sub1$ = new Subject();
const sub2$ = new Subject();
const usdObs$ = timer(0, 2000).pipe(
  map(() => 1300 + Math.random() * 10),
  tap(() => console.log("달러값이 변경되었습니다"))
);
// const usdObs$ = timer(0, 1500).pipe(map(() => 1300));

// sub1$.subscribe({
//   next: console.log,
// });

// sub2$.subscribe({
//   next: console.log,
// });

const sendingListOne = [
  {
    ticker: "EOS",
    price: 300,
  },
  {
    ticker: "XRP",
    price: 400,
  },
  { ticker: "ETH", price: 500 },
  {
    ticker: "BTC",
    price: 23730,
  },
  {
    ticker: "BCH",
    price: 700,
  },
  {
    ticker: "IMX",
    price: 800,
  },
  {
    ticker: "BTC",
    price: 23760,
  },
];

const sendingListTwo = [
  {
    ticker: "BCH",
    price: 800,
  },
  {
    ticker: "ETH",
    price: 600,
  },
  {
    ticker: "BTC",
    price: 31150000,
  },
  {
    ticker: "IMX",
    price: 900,
  },
  {
    ticker: "EOS",
    price: 400,
  },
  {
    ticker: "XRP",
    price: 500,
  },
  {
    ticker: "BTC",
    price: 31100000,
  },
];

const btcSub1$ = sub1$.pipe(filter((x) => x.ticker === "BTC"));

const otherSub1$ = sub1$.pipe(
  filter((x) => x.ticker !== "BTC"),
  tap(console.log)
);

const btcSub2$ = sub2$.pipe(filter((x) => x.ticker === "BTC"));

const otherSub2$ = sub2$.pipe(
  filter((x) => x.ticker !== "BTC"),
  tap(console.log)
);

const combinedBTCsub$ = combineLatest({ btcSub1$, btcSub2$, usdObs$ }).pipe(
  map((x) => {
    const usdtPremium =
      100 -
      ((x["btcSub1$"].price * (x["btcSub2$"].price / x["btcSub1$"].price)) /
        x["btcSub2$"].price) *
        100;
    const usdPremium =
      100 - ((x["btcSub1$"].price * x["usdObs$"]) / x["btcSub2$"].price) * 100;

    return Object.assign(x, {
      usdPremium,
      usdtPremium: usdtPremium > 0.01 ? usdtPremium : 0,
      usdt: x["btcSub2$"].price / x["btcSub1$"].price,
    });
  })
);

// btcSub1$.subscribe();
// otherSub1$.subscribe();
// btcSub2$.subscribe();
// otherSub2$.subscribe();
combinedBTCsub$.subscribe(console.log);

// --얘네들의 위치가 중요함. 구독 후에 발행을 해야지, 구독 전에 발행을 하도록 앞에 선언되어있으면 발행안함--
// sendingListOne.forEach((x) => {
//   sub1$.next(x);
// });
// sendingListTwo.forEach((x) => sub2$.next(x));
// -------------------------------------------------------------------------------------------------------

for (i = 1; i < sendingListOne.length + 1; i++) {
  (function (x) {
    setTimeout(() => {
      console.log(
        `1-${x - 1} 번째 ${sendingListOne[x - 1].ticker}를 발행합니다`
      );
      sub1$.next(sendingListOne[x - 1]);
    }, 1500 * x);
  })(i);
}

for (i = 1; i < sendingListTwo.length + 1; i++) {
  (function (x) {
    setTimeout(() => {
      console.log(
        `2-${x - 1} 번째 ${sendingListTwo[x - 1].ticker}를 발행합니다`
      );
      sub2$.next(sendingListTwo[x - 1]);
    }, 1500 * x);
  })(i);
}

// upbit --> filter -> XRP/KRW -------------------------------------
//                     BTC/KRW  ---                                 |
//                                 |-combineLatest---> USDT/KRW-----+--combineLatest---> {xrpkrw, xrpusdt, usdtkrw
// binance             BTC/USDT ---                                 |
//                     XRP/USDT-------------------------------------
