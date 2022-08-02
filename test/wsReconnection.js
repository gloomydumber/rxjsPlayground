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
  repeat,
  repeatWhen,
  delayWhen,
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

const RECONNECT_INTERVAL = 1000;
const webSocketSubject = webSocket("ws://localhost:8001");
// webSocketSubject
//   .pipe(
//     repeatWhen((errors) =>
//       errors.pipe(
//         tap((val) =>
//           console.log("[retry] Try to reconnect ", val, " ", Date.now())
//         ),
//         delayWhen((_) => timer(RECONNECT_INTERVAL))
//       )
//     )
//   )
//   .subscribe((value) => console.log("[retry] Receive ", value));

// webSocketSubject
//   .pipe(repeat({ delay: 1500 }))
//   .subscribe((value) => console.log("[retry] Receive ", value));

// webSocketSubject
//   .pipe(retry({ delay: 1500 }))
//   .subscribe((value) => console.log("[retry] Receive ", value));

// webSocketSubject
//   .pipe(repeat({ delay: 1500 }), retry({ delay: 1500 }))
//   .subscribe((value) => console.log("[retry] Receive ", value));

// webSocketSubject
//   .pipe(repeat({ delay: 1500 }), retry({ delay: 1500 }))
//   .subscribe({
//     next: (value) => console.log("[retry] Receive ", value),
//     error: (err) => console.log(err),
//   });

webSocketSubject
  .pipe(
    repeat({
      delay: (x) =>
        of(`${x}회 repeat 하였습니다`).pipe(
          tap((x) => console.log(x)),
          delayWhen((_) => timer(RECONNECT_INTERVAL))
        ),
    }),
    retry({
      delay: (err, x) =>
        of(`${x}회 retry 하였습니다`).pipe(
          tap((x) => console.log(x)),
          delayWhen((_) => timer(RECONNECT_INTERVAL))
        ),
    })
  )
  .subscribe({
    next: (value) => console.log(value),
    error: (err) => console.log(err),
    complete: (x) => console.log(x),
  });

// webSocketSubject
//   .pipe(
//     repeat((errors) =>
//       errors.pipe(
//         tap((val) =>
//           console.log("[retry] Try to reconnect ", val, " ", Date.now())
//         ),
//         delayWhen((_) => timer(RECONNECT_INTERVAL))
//       )
//     )
//   )
//   .subscribe((value) => console.log("[retry] Receive ", value));

// retry : 최초 접속이 되지 않으면, 재시도, 일단 연결이 되고나서 끊기는 연결은 재시도 하지 않음
// repeat : 최초 접속이 되지 않으면, 에러 Emit 후 종료
