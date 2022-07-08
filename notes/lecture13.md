# Lesson 13 - 기타 유용한 연산자들 2

### startWith/endWith : 맨 앞/뒤에 1~N개 요소 추가

```javascript
const { of } = require("rxjs");
const { startWith } = require("rxjs/operators");

const obs$ = of(1, 2, 3);

obs$.pipe(startWith(0)).subscribe(console.log);
// obs$.pipe(startWith(-2, -1, 0)).subscribe(console.log)
```

[🔗 rxjs 공식 문서 - startWith](https://rxjs.dev/api/operators/startWith)

[🔗 rxjs 공식 문서 - endWith](https://rxjs.dev/api/operators/endWith)

### every : 모든 발행물들이 주어진 조건에 부합하는가 여부

```javascript
const { of } = require("rxjs");
const { every } = require("rxjs/operators");

of(1, 3, 5, 7, 9, 11, 13, 15)
  .pipe(every((x) => x % 2 !== 0))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - every](https://rxjs.dev/api/operators/every)

### defaultIfEmpty : 발행물이 없을 시 기본값 발행

`timeoutWith` 와 유사한 면이 있음

```javascript
const { fromEvent, timer } = require("rxjs");
const { defaultIfEmpty, pluck, takeUntil } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(takeUntil(timer(5000)), pluck("x"), defaultIfEmpty("NO CLICK"))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - defaultIfEmpty](https://rxjs.dev/api/operators/defaultIfEmpty)

### retry : 발행 실패시 N회 재시도

_ajax_ 요청을 보낼 떄, 오류가 나는 경우 재시도 해야하는 경우 등에 활용

```javascript
const { range } = require("rxjs");
const { ajax } = require("rxjs/ajax");
const { mergeMap, pluck, retry } = require("rxjs/operators");

range(1, 20)
  .pipe(
    mergeMap((keyword) =>
      ajax(`http://127.0.0.1:3000/people/quarter-error/${keyword}`).pipe(
        pluck("response", "first_name"),
        retry(3)
      )
    )
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - retry](https://rxjs.dev/api/operators/retry)

### defer : 조건에 따라 스트림 발행

- 구독하는 순간에 조건에 따른 스트림을 생성 💡 옵저버블이 해당 코드가 실행되는 부분시점에서 생성되기 때문에 당시의 상태에 따라 만들어질 옵저버블이 결정되도록 할 수 있다

아래 예제 코드는 HTML CheckBox를 통한 예제 코드임

```javascript
const { defer, fromEvent, of } = require("rxjs");
const { pluck } = require("rxjs/operators");

fromEvent(document.querySelector("#check"), "change")
  .pipe(pluck("target", "checked"))
  .subscribe((checked) => {
    defer((_) => (checked ? of("CHECKED") : of("UNCHECKED"))).subscribe(
      console.log
    );
  });
```

[🔗 rxjs 공식 문서 - defer](https://rxjs.dev/api/operators/defer)

### iif : 단순화된 defer : 조건에 따라 두 스트림 중 하나 발행

- `false`시의 스트림이 주어지지 않으면 `false`시 바로 complete

(빈 스트림을 내보내서 바로 complete 하는 것임)

```javascript
const { iif, fromEvent, of } = require("rxjs");
const { pluck } = require("rxjs/operators");

fromEvent(document.querySelector("#check"), "change")
  .pipe(pluck("target", "checked"))
  .subscribe((checked) => {
    iif((_) => checked, of("CHECKED"), of("UNCHECKED")).subscribe(
      console.log,
      (err) => console.log(err),
      (_) => console.log("COMPLETE")
    );
  });
```

[🔗 rxjs 공식 문서 - iif](https://rxjs.dev/api/operators/iif)

### empty

아무 것도 발행하지않고 바로 complete

`stream`의 형식은 지켜야하나, 아무 것도 발행하지 않을 때 활용

```javascript
const { empty } = require("rxjs");

empty().subscribe(console.log, console.error, (_) => console.log("COMPLETE"));
```

[🔗 rxjs 공식 문서 - empty](https://rxjs.dev/api/operators/empty)

### throwError

```javascript
const { throwError } = require("rxjs");

throwError("ERROR").subscribe(console.log, console.error, (_) =>
  console.log("COMPLETE")
);
```

[🔗 rxjs 공식 문서 - throwError](https://rxjs.dev/api/operators/throwError)

### share : 스트림을 여러 구독자들간 공유

- 스트림의 부작용(`tap` 등)이 한 번만 발생
- 마치 `Subject`처럼 발행 값 또한 구독자 간에 공유된다

```javascript
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
```

[🔗 rxjs 공식 문서 - share](https://rxjs.dev/api/operators/share)

### shareReplay : share 된 스트림의 마지막 N개 발행물을 새 구독자에게 발행

`replaySubject`와 유사

```javascript
const { interval } = require("rxjs");
const { take, tap, takeLast, shareReplay } = require("rxjs/operators");

const obs$ = interval(1000).pipe(
  take(20),
  tap((x) => console.log(`side effect: ${x}`)),
  shareReplay(3)
);

obs$.subscribe((x) => console.log(`subscriber 1: ${x}`));

setTimeout((_) => {
  obs$.subscribe((x) => console.log(`subscriber 2: ${x}`));
}, 5000);
setTimeout((_) => {
  obs$.subscribe((x) => console.log(`subscriber 3: ${x}`));
}, 10000);
```

[🔗 rxjs 공식 문서 - shareReplay](https://rxjs.dev/api/operators/shareReplay)
