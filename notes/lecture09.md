# Lesson 9 - 시간을 다루는 연산자들 1

## 시간을 다루는 Operator 1

### delay : 주어진 시간만큼 지연 발행

```javascript
const { interval, fromEvent } = require("rxjs");
const { delay, tap, take } = require("rxjs/operators");

interval(1000)
  .pipe(
    take(5),
    tap((x) => console.log(x + " 발행시작")),
    delay(1500)
  )
  .subscribe((x) => console.log(x + " 발행완료"));

fromEvent(document, "click")
  .pipe(
    tap((e) => console.log(e.x + " 발행시작")),
    delay(1500)
  )
  .subscribe((e) => console.log(e.x + " 발행완료"));
```

[🔗 rxjs 공식 문서 - delay](https://rxjs.dev/api/operators/delay)

### timestamp : 타임스탬프

```javascript
const { fromEvent } = require("rxjs");
const { timestamp, pluck, map } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(pluck("x"), timestamp()) // unix timestamp를 기존 값과 함께 JSON 객체로 만들어 발행
  .subscribe(console.log);

fromEvent(document, "click")
  .pipe(
    pluck("x"),
    timestamp(),
    map((x) => {
      x.timestamp = new Date(x.timestamp).toString();
      return x;
    })
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - timestamp](https://rxjs.dev/api/operators/timestamp)

### timeinterval : 이전 발행물과의 시간차

```javascript
const { fromEvent, interval } = require("rxjs");
const { timeInterval, pluck } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(pluck("x"), timeInterval()) // 이전 발행물과 현재 발행물 간의 시간 차를 기존 값과 함께 JSON 객체로 만들어 발행
  .subscribe(console.log);

interval(1000).pipe(timeInterval()).subscribe(console.log); // 1000ms에 근접하긴 하나 미세한 오차 존재
```

[🔗 rxjs 공식 문서 - timeinterval](https://rxjs.dev/api/operators/timeinterval)

### timeout : 주어진 시간 내 다음 값 미발행 시 오류

```javascript
const { fromEvent } = require("rxjs");
const { ajax } = require("rxjs/ajax");
const { timeout, pluck } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(timeout(3000)) // 3초 안에 click event가 발생하지 않을 시 에러 반환, 클릭을 멈추고 3초 후도 에러 반환
  .subscribe(
    (_) => console.log("OK"),
    (err) => console.error(err)
  );

ajax("http://127.0.0.1:3000/people/name/random")
  .pipe(pluck("response"), timeout(500))
  .subscribe(console.log, console.error);
```

_ajax_ 요청 후, 특정 시간 안에 응답이 없을 경우에 활용 가능

[🔗 rxjs 공식 문서 - timeout](https://rxjs.dev/api/operators/timeout)

### timeoutWith : 주어진 시간 내 다음 값 미발행 시 다른 Observable 개시

```javascript
const { fromEvent, interval, of } = require("rxjs");
const { ajax } = require("rxjs/ajax");
const { timeoutWith, pluck, scan } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(
    timeoutWith(3000, interval(1000)),
    scan((acc, x) => {
      return acc + 1;
    }, 0)
  )
  .subscribe(console.log);

ajax("http://127.0.0.1:3000/people/name/random")
  .pipe(
    pluck("response"),
    timeoutWith(
      500,
      of({
        id: 0,
        first_name: "Hong",
        last_name: "Gildong",
        role: "substitute",
      })
    )
  )
  .subscribe(console.log, console.error);
```

[🔗 rxjs 공식 문서 - timeoutWith](https://rxjs.dev/api/operators/timeoutWith)
