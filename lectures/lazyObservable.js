const { of, interval, fromEvent } = require("rxjs");

const obs1$ = of("a", "b", "c");
const obs2$ = interval(1000);
const obs3$ = fromEvent(document, "click");

setTimeout((_) => {
  console.log("of 구독 시작");
  obs1$.subscribe((item) => console.log(item));
}, 5000);

setTimeout((_) => {
  console.log("Interval 구독 시작");
  obs2$.subscribe((item) => console.log(item));
}, 10000);

setTimeout((_) => {
  console.log("fromEvent 구독 시작");
  obs3$.subscribe((item) => console.log("click"));
}, 15000);

setTimeout((_) => {
  console.log("Interval 구독 시작");
  obs2$.subscribe((item) => console.log(item));
}, 20000);
