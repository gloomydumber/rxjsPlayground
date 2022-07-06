# Lesson 8 - take와 skip 관련 연산자들

## Take 관련 Operator

### take : 앞에서부터 N개 선택

```javascript
const { range, interval, fromEvent } = require("rxjs");
const { take, filter, pluck } = require("rxjs/operators");

range(1, 20).pipe(take(5)).subscribe(console.log);

range(1, 20)
  .pipe(
    filter((x) => x % 2 === 0),
    take(5)
  )
  .subscribe(console.log);

range(1, 20)
  .pipe(
    take(5),
    filter((x) => x % 2 === 0)
  )
  .subscribe(console.log);

interval(1000)
  .pipe(take(5)) // interval은 stream을 complete 시키기 않는데, take를 통해 종료 시점 제공
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(take(5), pluck("x"))
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(
    pluck("x"),
    filter((x) => x < 200),
    take(5)
  )
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );
```

[🔗 rxjs 공식 문서 - take](https://rxjs.dev/api/operators/take)

### takeLast : 뒤에서부터 N개 선택

```javascript
const { range, interval, fromEvent } = require("rxjs");
const { takeLast, take, pluck } = require("rxjs/operators");

range(1, 20).pipe(takeLast(5)).subscribe(console.log); // 16, 17, 18, 19, 20 순차적으로 발행

interval(1000)
  .pipe(takeLast(5)) // Interval에 끝이 없으므로 아무 값도 발행하지 않을 것임
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

interval(1000)
  .pipe(take(10), takeLast(5))
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(takeLast(5), pluck("x")) // 이벤트의 끝이 없으므로 아무 값도 발행하지 않을 것임
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(take(10), takeLast(5), pluck("x"))
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );
```

[🔗 rxjs 공식 문서 - takeLast](https://rxjs.dev/api/operators/takeLast)

### takeWhile : ~하는동안 선택

```javascript
const { range, interval, fromEvent } = require("rxjs");
const { takeWhile, takeLast, filter, pluck } = require("rxjs/operators");

range(1, 20)
  .pipe(takeWhile((x) => x <= 10))
  .subscribe(console.log);

interval(1000)
  .pipe(takeWhile((x) => x < 5))
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(
    pluck("x"),
    takeWhile((x) => x < 200)
  )
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );
```

[🔗 rxjs 공식 문서 - takeWhile](https://rxjs.dev/api/operators/takeWhile)

### takeUntil : 기준이 되는 스트림이 발행하기까지

```javascript
const { interval, timer, fromEvent } = require("rxjs");
const { ajax } = require("rxjs/ajax");
const { takeUntil, pluck, tap } = require("rxjs/operators");

obs1$ = interval(1000);
obs2$ = fromEvent(document, "click");

obs1$.pipe(takeUntil(obs2$)).subscribe(
  console.log,
  (err) => console.error(err),
  (_) => console.log("COMPLETE")
); // obs1$의 발행이 complete 되는 순간은 obs2$가 발행이 시작되는 순간임

obs1$ = fromEvent(document, "click");
obs2$ = timer(5000);

obs1$.pipe(pluck("x"), takeUntil(obs2$)).subscribe(
  console.log,
  (err) => console.error(err),
  (_) => console.log("COMPLETE")
);

interval(50)
  .pipe(
    takeUntil(
      ajax("http://127.0.0.1:3000/people/name/random").pipe(
        pluck("response"),
        tap(console.log)
      )
    )
  )
  .subscribe(console.log); // ajax 요청을 하고, 응답이 올 때까지 애니메이션을 구현하는 등에 활용 가능
```

[🔗 rxjs 공식 문서 - takeUntil](https://rxjs.dev/api/operators/takeUntil)

## skip 관련 Operator

### skip : 앞에서부터 N개 건너뛰기

```javascript
const { range, interval, fromEvent } = require("rxjs");
const { skip, filter, pluck } = require("rxjs/operators");

range(1, 20).pipe(skip(5)).subscribe(console.log); // 6, 7, 8, 9, 10, 11, ...

interval(1000)
  .pipe(skip(5))
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(skip(5), pluck("x"))
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );
```

[🔗 rxjs 공식 문서 - skip](https://rxjs.dev/api/operators/skip)

### skipLast : 뒤에서부터 N개 건너뛰기

```javascript
const { range, interval, fromEvent } = require("rxjs");
const { skipLast, pluck } = require("rxjs/operators");

range(1, 20).pipe(skipLast(5)).subscribe(console.log);

interval(1000)
  .pipe(skipLast(5)) // 5초후, 현재 까지 발행된 5개를 제외한, 밀린 값들이 출력됨
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(skipLast(5), pluck("x")) // 처음 5번의 클릭은 제외하다가, 이후 이벤트 부터 밀려서 출력됨 (즉, 출력되는 값은 5회 이전의 클릭 이벤트의 x좌표)
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );
```

❗❗❗

[🔗 rxjs 공식 문서 - skipLast](https://rxjs.dev/api/operators/skipLast)

### skipWhile : ~하는동안 건너뛰기

```javascript
const { range, interval, fromEvent } = require("rxjs");
const { skipWhile, filter, pluck } = require("rxjs/operators");

range(1, 20)
  .pipe(skipWhile((x) => x <= 10))
  .subscribe(console.log);

interval(1000)
  .pipe(skipWhile((x) => x < 5))
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );

fromEvent(document, "click")
  .pipe(
    pluck("x"),
    skipWhile((x) => x < 200)
  )
  .subscribe(
    console.log,
    (err) => console.error(err),
    (_) => console.log("COMPLETE")
  );
```

[🔗 rxjs 공식 문서 - skipWhile](https://rxjs.dev/api/operators/skipWhile)

### skipUntil : 기준이 되는 스트림이 발행하고부터

```javascript
const { interval, timer, fromEvent } = require("rxjs");
const { skipUntil, pluck } = require("rxjs/operators");

const obs1$ = interval(1000);
const obs2$ = fromEvent(document, "click");

obs1$.pipe(skipUntil(obs2$)).subscribe(
  console.log,
  (err) => console.error(err),
  (_) => console.log("COMPLETE")
);

const obs1$ = fromEvent(document, "click");
const obs2$ = timer(5000);

obs1$.pipe(pluck("x"), skipUntil(obs2$)).subscribe(
  console.log,
  (err) => console.error(err),
  (_) => console.log("COMPLETE")
);
```

[🔗 rxjs 공식 문서 - skipUntil](https://rxjs.dev/api/operators/skipUntil)
