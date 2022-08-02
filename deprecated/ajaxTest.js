global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { Observable, interval, timer } = require("rxjs");
const { ajax } = require("rxjs/ajax");
const { pluck, mergeMap } = require("rxjs/operators");

// const obs$ = new Observable((subscriber) => {
//   setInterval(() => {
//     const result = ajax(
//       "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
//     ).pipe(pluck("response", 0, "basePrice"));
//     subscriber.next(1);
//   }, 2000);
// });

// const obs$ = ajax(
//   "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
// ).pipe(pluck("response", 0, "basePrice"));

// const obs$ = timer(0, 2000).pipe(
//   mergeMap(() =>
//     ajax(
//       "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
//     )
//   ),
//   pluck("response", 0, "basePrice")
// );

const obs2$ = timer(0, 4 * 1000);

const obs$ = timer(0, 2000).pipe(
  mergeMap(() =>
    ajax(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
    ).pipe(pluck("response", 0, "basePrice"))
  )
);

obs$.subscribe((result) => console.log(result));

// n초마다 한번씩 ajax 발행 후 값 전달
// interval, ajax, pluck
