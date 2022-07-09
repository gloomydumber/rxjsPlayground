global.WebSocket = require("ws");
const { KRW } = require("./krw");
const { webSocket } = require("rxjs/webSocket");
const { map } = require("rxjs/operators");
const { v4 } = require("uuid");

const subject = webSocket("wss://api.upbit.com/websocket/v1");

// subject.subscribe(
//   //   next: (msg) => console.log("message received: " + msg), // Called whenever there is a message from the server.
//   //   error: (err) => console.log(err), // Called if at any point WebSocket API signals some kind of error.
//   //   complete: () => console.log("complete"), // Called when connection is closed (for whatever reason).
//   (message) => console.log(message)
// );

// subject.subscribe();

// subject.pipe(tap((x) => console.log(x))).subscribe();

subject
  .pipe(map((x) => ({ market: x.code, price: x.trade_price })))
  .subscribe((msg) => console.log(msg));

const upbitInit = JSON.parse(
  `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ${JSON.stringify(
    KRW
  )} }]`
);

subject.next(upbitInit);

// subject.next({
//   message: `ping`,
// });

// ====>map===>|--------------------------------|
//             | BTC{upbit: 1000, binance: 900} | ===> 대출해줘 =>
// ====>map===>|--------------------------------|
