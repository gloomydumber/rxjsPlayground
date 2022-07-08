# Lesson 12 - 기타 유용한 연산자들 1

### sequenceEqual Operator

타이밍에 관계없이, 두 스트림 발행물들의 순서와 값 동일 여부 반환

```javascript
const { from, fromEvent } = require("rxjs");
const { sequenceEqual, mergeMap, map, take } = require("rxjs/operators");

const num$ = from([3, 1, 4, 7, 5, 8, 2]);

const key$ = fromEvent(document, "keyup")
  .pipe(
    map((e) => Number(e.code.replace("Digit", ""))),
    take(7),
    sequenceEqual(num$)
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - sequenceEqual](https://rxjs.dev/api/operators/sequenceEqual)

### distinctUntilChanged Operator

같은값이 연속되는 것만 제외

```javascript
const { of } = require("rxjs");
const { distinctUntilChanged } = require("rxjs/operators");

of(1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 3, 4, 4, 1)
  .pipe(distinctUntilChanged())
  .subscribe(console.log);
```

```javascript
const { from } = require("rxjs");
const { distinctUntilChanged } = require("rxjs/operators");

const students = [
  { name: "홍길동", sex: "male" },
  { name: "전우치", sex: "male" },
  { name: "아라치", sex: "female" },
  { name: "성춘향", sex: "female" },
  { name: "임꺽정", sex: "male" },
];
from(students)
  .pipe(distinctUntilChanged((a, b) => a.sex === b.sex))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - distinctUntilChanged](https://rxjs.dev/api/operators/distinctUntilChanged)

### combineLatest Operator

두 스트림을 각 최신 값들끼리 결합 (`zip`과 비교)

```javascript
const { combineLatest, interval, fromEvent } = require("rxjs");
const { pluck } = require("rxjs/operators");

combineLatest(
  interval(2000),
  fromEvent(document, "click").pipe(pluck("x"))
).subscribe(console.log);
```

[🔗 rxjs 공식 문서 - zip](https://rxjs.dev/api/operators/zip)

[🔗 rxjs 공식 문서 - combineLatest](https://rxjs.dev/api/operators/combineLatest)

### buffer Operator

```javascript
const { interval, fromEvent } = require("rxjs");
const { buffer } = require("rxjs/operators");

interval(1000)
  .pipe(buffer(fromEvent(document, "click")))
  .subscribe(console.log);
```

bv
[🔗 rxjs 공식 문서 - buffer](https://rxjs.dev/api/operators/buffer)

### bufferCount Operator

첫 번 째 인자의 개수 만큼 _buffer_ 처리하여 출력

두 번 째 인자의 크기 만큼 _shift_ 하여 출력

```javascript
const { range } = require("rxjs");
const { bufferCount } = require("rxjs/operators");

range(1, 100).pipe(bufferCount(10, 10)).subscribe(console.log);
```

```javascript
// 클릭 3번중 한 번만 반응하기
const { fromEvent } = require("rxjs");
const { bufferCount } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(bufferCount(3))
  .subscribe((_) => console.log("FIRE"));
```

[🔗 rxjs 공식 문서 - bufferCount](https://rxjs.dev/api/operators/bufferCount)

### bufferTime Operator

시간 단위로 _buffer_ 처리하여 출력

```javascript
const { interval } = require("rxjs");
const { bufferTime } = require("rxjs/operators");

interval(200).pipe(bufferTime(2000)).subscribe(console.log);
```

[🔗 rxjs 공식 문서 - bufferTime](https://rxjs.dev/api/operators/bufferTime)

### groupBy Operator

조건에 따라 별개의 `stream`으로 나누어 발행

```javascript
const { range } = require("rxjs");
const { groupBy, mergeMap, toArray } = require("rxjs/operators");

range(1, 50)
  .pipe(
    groupBy((x) => x % 3), // 3으로 나누었을 때 0, 1, 2의 나머지를 갖는 3개의 케이스로 스트림 분류
    mergeMap((groups$) => groups$.pipe(toArray()))
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - groupBy](https://rxjs.dev/api/operators/groupBy)
