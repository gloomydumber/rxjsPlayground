# Lesson 11 - 스트림을 결합하는 연산자들

## 스트림 결합 연산자

### merge : 두 스트림을 순서 관계없이 병합

```javascript
const { merge, interval, fromEvent } = reqruie("rxjs");
const { map } = require("rxjs/operators");

const interval$ = interval(1000).pipe(map((_) => "interval"));
const click$ = fromEvent(document, "click").pipe(map((_) => "click"));

merge(interval$, click$).subscribe(console.log);
```

```javascript
const { merge, interval } = reqruie("rxjs");
const { map, take } = require("rxjs/operators");

const intv1$ = interval(1000).pipe(
  map((_) => "INTERVAL 1"),
  take(3)
);
const intv2$ = interval(1000).pipe(
  map((_) => "INTERVAL 2"),
  take(6)
);
const intv3$ = interval(1000).pipe(
  map((_) => "INTERVAL 3"),
  take(9)
);
const intv4$ = interval(1000).pipe(
  map((_) => "INTERVAL 4"),
  take(9)
);
const intv5$ = interval(1000).pipe(
  map((_) => "INTERVAL 5"),
  take(9)
);

merge(intv1$, intv2$, intv3$, intv4$, intv5$, 3).subscribe(console.log);
```

`merge`에서 가장 마지막 인자는 한 번에 몇개 씩 병합할지에 관한 인자다

만약, *1*을 그 인자로 전달하면, 순전히 이어붙인 `concat`과 같이 동작한다

[🔗 rxjs 공식 문서 - merge](https://rxjs.dev/api/operators/merge)

### concat : 스트림을 순서대로 이어붙임

```javascript
const { concat, interval } = reqruie("rxjs");
const { map, take } = require("rxjs/operators");

const intv1$ = interval(1000).pipe(
  map((_) => "INTERVAL 1"),
  take(3)
);
const intv2$ = interval(1000).pipe(
  map((_) => "INTERVAL 2"),
  take(3)
);
const intv3$ = interval(1000).pipe(
  map((_) => "INTERVAL 3"),
  take(3)
);

concat(intv1$, intv2$, intv3$).subscribe(console.log);
```

```javascript
const { concat, interval, fromEvent } = reqruie("rxjs");
const { map, take } = require("rxjs/operators");

const interval$ = interval(1000).pipe(
  map((_) => "interval"),
  take(5)
);
const click$ = fromEvent(document, "click").pipe(map((_) => "click"));

concat(interval$, click$).subscribe(console.log);
```

위 예제에서, *interval*이 끝나고 나서 발생하는 클릭 *event*만 `stream`으로 발행됨

즉, *interval*이 발행 중 일 때 발생한 클릭 *event*는 *interval*에 의한 값들의 발행이 끝나더라도 발행되지 않는다

`Observable`은 누군가가 `Subscribe`한 시점부터 값을 발행하는데, `concat`이 시작될 때, 모든 값을 `Subscribe`하고 나서 결과가 출력되는 것이 아니라, 앞 선 `stream`이 `complete` 된 이후에 다음 `stream`이 `Subscribe`되는 구조라서 그렇다

[🔗 rxjs 공식 문서 - concat](https://rxjs.dev/api/operators/concat)

### mergeMap : (mergeAll 참조)

```javascript
const { interval, fromEvent } = reqruie("rxjs");
const { mergeMap, map, take } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(
    mergeMap((e) =>
      interval(1000).pipe(
        map((i) => e.x + " : " + i),
        take(5)
      )
    )
  )
  .subscribe(console.log);
```

```javascript
const { of } = reqruie("rxjs");
const { ajax } = require("rxjs/ajax");
const { mergeMap, pluck } = require("rxjs/operators");

of(3, 15, 4, 9, 1, 7)
  .pipe(
    mergeMap((keyword) =>
      ajax(`http://127.0.0.1:3000/people/${keyword}`).pipe(
        pluck("response", "first_name")
      )
    )
  )
  .subscribe(console.log);
```

🚨 _영상에 나오지 않은 내용 - `mergeMap` 역시 두 번째 인자로 몇 개의 스트림을 동시 진행할 것인지 설정할 수 있다_

```javascript
const { of } = reqruie("rxjs");
const { ajax } = require("rxjs/ajax");
const { mergeMap, pluck } = require("rxjs/operators");

of(3, 15, 4, 9, 1, 7)
  .pipe(
    mergeMap(
      (keyword) =>
        ajax(`http://127.0.0.1:3000/people/${keyword}`).pipe(
          pluck("response", "first_name")
        ),
      3
    ) // 한 번에 3개 스트림만
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - mergeAll](https://rxjs.dev/api/operators/mergeAll)

[🔗 rxjs 공식 문서 - mergeMap](https://rxjs.dev/api/operators/mergeMap)

### concatMap : (concatAll 참조)

```javascript
const { interval, fromEvent } = reqruie("rxjs");
const { concatMap, map, take } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(
    concatMap((e) =>
      interval(1000).pipe(
        map((i) => e.x + " : " + i),
        take(5)
      )
    )
  )
  .subscribe(console.log);
```

🚨 _영상에 나오지 않은 내용 - `mergeMap` 예제와 달리 `concatMap`으로 ajax 요청들을 보내면 늘 동일한 순서로 이름들이 반환된다_

```javascript
const { of } = reqruie("rxjs");
const { ajax } = require("rxjs/ajax");
const { concatMap, pluck } = require("rxjs/operators");

of(3, 15, 4, 9, 1, 7)
  .pipe(
    concatMap((keyword) =>
      ajax(`http://127.0.0.1:3000/people/${keyword}`).pipe(
        pluck("response", "first_name")
      )
    )
  )
  .subscribe(console.log);
```

🚨 _영상에 나오지 않은 내용 - `mergeMap`과 `concatMap`의 마블 다이어그램도 공식 명세를 통해 살펴보자_

[🔗 rxjs 공식 문서 - concatAll](https://rxjs.dev/api/operators/concatAll)

[🔗 rxjs 공식 문서 - conatMap](https://rxjs.dev/api/operators/conatMap)

### switchMap : 기준 스트림이 새 값을 발행하면 진행중이던 스트림을 멈춤

```javascript
const { interval, fromEvent } = reqruie("rxjs");
const { switchMap, map, take } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(
    switchMap((e) =>
      interval(1000).pipe(
        map((i) => e.x + " : " + i),
        take(5)
      )
    )
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - switchMap](https://rxjs.dev/api/operators/switchMap)

## ~MapTo 연산자들 : 값은 두번째 스트림에서만 발행

### mergeMapTo

```javascript
const { interval, fromEvent } = reqruie("rxjs");
const { mergeMapTo, take } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(mergeMapTo(interval(1000).pipe(take(5))))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - mergeMapTo](https://rxjs.dev/api/operators/mergeMapTo)

### concatMapTo

```javascript
const { interval, fromEvent } = reqruie("rxjs");
const { concatMapTo, take } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(concatMapTo(interval(1000).pipe(take(5))))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - concatMapTo](https://rxjs.dev/api/operators/concatMapTo)

### switchMapTo

```javascript
const { interval, fromEvent } = reqruie("rxjs");
const { switchMapTo, take } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(switchMapTo(interval(1000).pipe(take(5))))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - switchMapTo](https://rxjs.dev/api/operators/switchMapTo)
