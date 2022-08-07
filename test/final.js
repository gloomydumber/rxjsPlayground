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

const tickerObs$ = of(...TICKERS).pipe(
  mergeMap((x) => {
    const upbit = subjectUpbit.pipe(
      filter((y) => y.code.split("-")[1] === x),
      map((z) => ({ market: z.code, price: z.trade_price })),
      repeat({ delay: 2500 }),
      retry({ delay: 2500 })
    );
    const binance = subjectBinance.pipe(
      filter((y) => y.s.slice(0, -4) === x),
      map((z) => ({ market: z.s, price: Number(z.c) })),
      repeat({ delay: 2500 }),
      retry({ delay: 2500 })
    );

    return combineLatest({ upbit, binance });
  })
);

const btc = tickerObs$.pipe(
  filter((x) => x.upbit.market === "KRW-BTC"),
  map((x) => {
    x.usdtPrice = Number((x.upbit.price / x.binance.price).toFixed(2));
    x.usdtPremium = 0;
    return x;
  })
);
const usdt = btc.pipe(
  map((x) => ({
    usdtPrice: x.usdtPrice,
  }))
);
const nonBTC = tickerObs$.pipe(filter((x) => x.upbit.market !== "KRW-BTC"));
const nonBTCwithUSDT = combineLatest({ nonBTC, usdt }).pipe(
  map((x) => ({ ...x.nonBTC, ...x.usdt })),
  map((x) => ({
    ...x,
    usdtPremium: Number(
      ((1 - (x.binance.price * x.usdtPrice) / x.upbit.price) * 100).toFixed(2)
    ),
  }))
);

const usd = timer(0, 3000).pipe(
  switchMap(() =>
    ajax(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
    ).pipe(
      pluck("response", 0, "basePrice"),
      map((x) => ({ usdPrice: x }))
    )
  )
);

const btcWithUSD = combineLatest({ btc, usd }).pipe(
  map((x) => ({ ...x.btc, ...x.usd })),
  map((x) => ({
    ...x,
    usdPremium: Number(
      ((1 - (x.binance.price * x.usdPrice) / x.upbit.price) * 100).toFixed(2)
    ),
  }))
);
const nonBTCwithUSDTandUSD = combineLatest({ nonBTCwithUSDT, usd }).pipe(
  map((x) => ({ ...x.nonBTCwithUSDT, ...x.usd })),
  map((x) => ({
    ...x,
    usdPremium: Number(
      ((1 - (x.binance.price * x.usdPrice) / x.upbit.price) * 100).toFixed(2)
    ),
  }))
);

merge(btcWithUSD, nonBTCwithUSDTandUSD).subscribe((x) =>
  console.log(x, new Date().toISOString())
);
