const { interval } = require("rxjs");

const { tap, filter, map } = require("rxjs/operators");
const observable$ = interval(1000);

// ... observer 정의

observable$
  .pipe(
    tap(console.log), // tap 함수는 원하는 동작을 파이프 중간에서 실행 해 볼 떄 사용
    filter((x) => x % 2 === 0),
    map((x) => x * x)
  )
  .subscribe((x) => console.log(x, "발행"));
