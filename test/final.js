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
  delayWhen,
} = require("rxjs/operators");
const { v4 } = require("uuid");
const { combineLatest, timer, of, filter, merge, share } = require("rxjs");
process.env.NTBA_FIX_319 = 1; // no warning for node-telegram-bot-api deprecated warning
// https://github.com/yagop/node-telegram-bot-api/issues/540
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config({ path: "../.env" });

const RECONNECT_INTERVAL = 2500;

function getDate() {
  let date = new Date();
  let Y, M, D, h, m, s;
  Y = date.getFullYear();
  M = dateZeroFormatter(date.getMonth() + 1);
  D = dateZeroFormatter(date.getDate());
  h = dateZeroFormatter(date.getHours());
  m = dateZeroFormatter(date.getMinutes());
  s = dateZeroFormatter(date.getSeconds());
  date = `${Y}-${M}-${D} ${h}:${m}:${s} 🤔`;
  return date;
}

function dateZeroFormatter(t) {
  if (t < 10) return `0${t}`;
  else return t;
}

const token = process.env.TELEGRAM_TOKEN;
const errChatID = "-1001151156977";
// const bot = new TelegramBot(token, {polling: true});
const bot = new TelegramBot(token);

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
      repeat({
        delay: (x) =>
          of(x).pipe(
            tap((x) => {
              bot.sendMessage(
                errChatID,
                `Upbit WebSocket\n repeat operator ${x} times activated\n at : ${getDate()}`,
                { parse_mode: "markdown" }
              );
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL))
          ),
      }),
      retry({
        delay: (err, x) =>
          of(x).pipe(
            tap((x) => {
              bot.sendMessage(
                errChatID,
                `Upbit WebSocket\n retry operator ${x} times activated\n at : ${getDate()}`,
                { parse_mode: "markdown" }
              );
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL))
          ),
      })
    );
    const binance = subjectBinance.pipe(
      filter((y) => y.s.slice(0, -4) === x),
      map((z) => ({ market: z.s, price: Number(z.c) })),
      repeat({
        delay: (x) =>
          of(x).pipe(
            tap((x) => {
              bot.sendMessage(
                errChatID,
                `Binance WebSocket\n repeat operator ${x} times activated\n at : ${getDate()}`,
                { parse_mode: "markdown" }
              );
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL))
          ),
      }),
      retry({
        delay: (err, x) =>
          of(x).pipe(
            tap((x) => {
              bot.sendMessage(
                errChatID,
                `Binance WebSocket\n retry operator ${x} times activated\n at : ${getDate()}`,
                { parse_mode: "markdown" }
              );
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL))
          ),
      })
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
      map((x) => ({ usdPrice: x })),
      repeat({
        delay: (x) =>
          of(x).pipe(
            tap((x) => {
              bot.sendMessage(
                errChatID,
                `Fethcing USD\n repeat operator ${x} times activated\n at : ${getDate()}`,
                { parse_mode: "markdown" }
              );
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL))
          ),
      }),
      retry({
        delay: (err, x) =>
          of(x).pipe(
            tap((x) => {
              bot.sendMessage(
                errChatID,
                `Fethcing USD\n retry operator ${x} times activated\n at : ${getDate()}`,
                { parse_mode: "markdown" }
              );
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL))
          ),
      })
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
