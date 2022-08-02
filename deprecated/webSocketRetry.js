global.WebSocket = require("ws");
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { KRW } = require("../test/krw");
const { USDT } = require("../test/usdt");
const { TICKERS } = require("../test/tickers");
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

// const subjectWS = webSocket("ws://localhost:8001").pipe(retry({ delay: 1500 }));
// subjectWS.subscribe(console.log);

// const subjectWS2 = new Observable(() => {
//   const connection = webSocket("ws://localhost:8001");
//   return connection;
// });
// subjectWS2.pipe(retry({ delay: 1500 })).subscribe(console.log);

// const source = new Subject(() => {
//   const socket = webSocket("ws://localhost:8001");
//   return socket;
// });
// source.pipe(retry({ delay: 1500 })).subscribe(console.log);

// const subject = webSocket("ws://localhost:8001");

// const observableA = subject.multiplex(
//   () => ({ subscribe: "A" }), // When server gets this message, it will start sending messages for 'A'...
//   () => ({ unsubscribe: "A" }), // ...and when gets this one, it will stop.
//   (message) => true // If the function returns `true` message is passed down the stream. Skipped if the function returns false.
// );

// const observableB = subject.multiplex(
//   // And the same goes for 'B'.
//   () => ({ subscribe: "B" }),
//   () => ({ unsubscribe: "B" }),
//   (message) => message.type === "B"
// );

// const subA = observableA.subscribe((messageForA) => console.log(messageForA));
// At this moment WebSocket connection is established. Server gets '{"subscribe": "A"}' message and starts sending messages for 'A',
// which we log here.

// const subB = observableB.subscribe((messageForB) => console.log(messageForB));
// // Since we already have a connection, we just send '{"subscribe": "B"}' message to the server. It starts sending messages for 'B',
// // which we log here.

// subB.unsubscribe();
// // Message '{"unsubscribe": "B"}' is sent to the server, which stops sending 'B' messages.

// subA.unsubscribe();
// // Message '{"unsubscribe": "A"}' makes the server stop sending messages for 'A'. Since there is no more subscribers to root Subject,
// // socket connection closes.

const ws$ = new webSocket({
  url: "ws://localhost:8001",
  openObserver: {
    next() {
      console.log("this should appear twice");
    },
  },
  closeObserver: {
    next() {
      console.log("this does appear twice");
    },
  },
});

ws$.pipe(retry({ delay: 1500 })).subscribe(console.log);
