// share test 필요

const { interval } = require("rxjs");
const { take, tap, takeLast, share } = require("rxjs/operators");

const obs$ = interval(1000).pipe(
  take(20),
  tap((x) => console.log(`side effect: ${x}`)),
  share()
);

obs$.subscribe((x) => console.log(`subscriber 1: ${x}`));

setTimeout((_) => {
  obs$.subscribe((x) => console.log(`subscriber 2: ${x}`));
}, 5000);
setTimeout((_) => {
  obs$.subscribe((x) => console.log(`subscriber 3: ${x}`));
}, 10000);
