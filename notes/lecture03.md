# Lesson 3 - Operator 사용해보기

## Creation Operators:

- `Observable`을 생성
  - of, from, range, fromEvent, timeout, interval...
- `rxjs`에서 로드

## Pipable Operators:

- `Observable`의 데이터를 *pure function*으로 가공
  - (현존하는 데이터를 수정하지 않음)
- `rxjs.operators`에서 로드
- `pipe` 함수에 하나 이상 넣어 연결
- [🔗 참고영상 - 함수형 프로그래밍](https://www.youtube.com/watch?v=jVG5jvOzu9Y&ab_channel=%EC%96%84%ED%8C%8D%ED%95%9C%EC%BD%94%EB%94%A9%EC%82%AC%EC%A0%84)

```javascript
const { range } = require("rxjs");

const { filter } = require("rxjs/operators");
const observable$ = range(1, 10);

const observer = {
  next: (x) => console.log(x + " 발행"),
  error: (err) => console.error("발행중 오류", err),
  complete: () => console.log("발행물 완결"),
};

observable$.pipe(filter((x) => x % 2 === 0)).subscribe(observer);
```

파이프에는 *하나 이상*의 Operator들이 쉼표로 구분되어 들어갈 수 있다

```javascript
// 위 코드에서 pipe에 map 추가해보기
map((x) => x * x);
```

아래는 추가한 결과 코드

```javascript
const { range } = require("rxjs");

const { filter, map } = require("rxjs/operators");
const observable$ = range(1, 10);

const observer = {
  next: (x) => console.log(x + " 발행"),
  error: (err) => console.error("발행중 오류", err),
  complete: () => console.log("발행물 완결"),
};

observable$
  .pipe(
    filter((x) => x % 2 === 0),
    map((x) => x * x) // , 구분하여 추가
  )
  .subscribe(observer);
```

시간, 이벤트에 의한 발행물에 적용해보기

```javascript
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
```

`tap` 함수는 원하는 동작을 파이프 중간에서 실행 해 볼 때 사용한다

아래는 공식문서의 `tap`의 정의이다

> Used when you want to affect outside state with a notification without altering the notification

[시간, 이벤트에 의한 발행물에 적용해보기 (코드는 시간 예제)](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/timeEventOperator.js)

```javascript
const { fromEvent } = require("rxjs");

const { map } = require("rxjs/operators");
const observable$ = fromEvent(document, "click");

// ... observer 정의

observable$
  .pipe(map((e) => e.x + " " + e.y))
  .subscribe((x) => console.log(x, "발행"));
```

## 마블 다이어그램 읽기

![marble-diagrm](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/marble-diagram.png)

## References

[🔗 rxjs 공식 문서 - Operators](https://rxjs-dev.firebaseapp.com/guide/operators)
