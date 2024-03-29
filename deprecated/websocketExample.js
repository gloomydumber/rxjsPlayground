global.WebSocket = require("ws");
const { KRW } = require("../data/krw");
const { USDT } = require("../data/usdt");
const { webSocket } = require("rxjs/webSocket");
const { tap, pluck, map } = require("rxjs/operators");
const { v4 } = require("uuid");

const binanceQuery = USDT.join("@trade/") + "@trade";
const subject = webSocket(`wss://stream.binance.com:9443/ws/${binanceQuery}`);
// const subject = webSocket("wss://api.upbit.com/websocket/v1");

// wss://socketsbay.com/wss/v2/2/demo/
// wss://api.upbit.com/websocket/v1
// `wss://stream.binance.com:9443/ws/${binanceQuery}`;

// subject.subscribe(
//   //   next: (msg) => console.log("message received: " + msg), // Called whenever there is a message from the server.
//   //   error: (err) => console.log(err), // Called if at any point WebSocket API signals some kind of error.
//   //   complete: () => console.log("complete"), // Called when connection is closed (for whatever reason).
//   (message) => console.log(message)
// );

// subject.subscribe();

// subject.pipe(tap((x) => console.log(x))).subscribe();

subject
  .pipe(map((x) => ({ market: x.s, price: x.t })))
  .subscribe((msg) => console.log(msg));

// subject.subscribe({
//   next: (msg) => {
//     msg.pipe(tap((x) => console.log(x)));
//   },
// });

// subject.subscribe();

const upbitInit = JSON.parse(
  `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ${JSON.stringify(
    KRW
  )} }]`
);

// subject.next(upbitInit);

// subject.next({
//   message: `ping`,
// });

// ====>map===>|--------------------------------|
//             | BTC{upbit: 1000, binance: 900} | ===> 대출해줘 =>
// ====>map===>|--------------------------------|
