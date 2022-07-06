# Lesson 7 - Transformation 연산자들

`pipeline`을 통과하는 값들을 원하는 형식으로 _변환(Transform)_ 해주는 연산자들

## map Operator

```javascript
const { of } = require("rxjs");
const { map } = require("rxjs/operators");

of(1, 2, 3, 4, 5)
  .pipe(map((x) => x * x))
  .subscribe(console.log);
```

```javascript
const { from } = require("rxjs");
const { map } = require("rxjs/operators");

from([
  { name: "apple", price: 1200 },
  { name: "carrot", price: 800 },
  { name: "meat", price: 5000 },
  { name: "milk", price: 2400 },
])
  .pipe(map((item) => item.price))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - map](https://rxjs.dev/api/operators/map)

## pluck Operator

```javascript
const { from } = require("rxjs");
const { pluck } = require("rxjs/operators");

const obs$ = from([
  { name: "apple", price: 1200, info: { category: "fruit" } },
  { name: "carrot", price: 800, info: { category: "vegetable" } },
  { name: "pork", price: 5000, info: { category: "meet" } },
  { name: "milk", price: 2400, info: { category: "drink" } },
]);

obs$.pipe(pluck("price")).subscribe(console.log);

obs$.pipe(pluck("info"), pluck("category")).subscribe(console.log); // 아래와 같은 코드

obs$.pipe(pluck("info", "category")).subscribe(console.log); // 위의 코드 보다 이렇게 써주는 것이 좋은 코드
```

`pluck`을 사용할 때, 하위 field로 접근할 때에는 같은 `pluck`을 두 번 이상 이어 써도 동작은 하나, 한 번의 `plcuk`을 사용하면서 field명을 *,*로 순서에 맞춰 이어주는 편이 더 좋은 코드이다

```javascript
const { ajax } = require("rxjs");
const { pluck } = require("rxjs/operators");

const obs$ = ajax(`https://api.github.com/search/users?q=user:mojombo`).pipe(
  pluck("response", "items", 0, "html_url") // 항목명, 항목명, 배열 index, 항목명
);
obs$.subscribe(console.log);
```

[🔗 rxjs 공식 문서 - pluck](https://rxjs.dev/api/operators/pluck)

## toArray Operator

```javascript
const { range } = require("rxjs");
const { toArray, filter } = require("rxjs/operators");

range(1, 50)
  .pipe(
    filter((x) => x % 3 === 0),
    filter((x) => x % 2 === 1),
    toArray()
  )
  .subscribe(console.log);
```

출력될 모든 값들을 하나의 배열로 만들어서 반환

[🔗 rxjs 공식 문서 - toArray](https://rxjs.dev/api/operators/toArray)

## scan Operator

```javascript
const { of } = require("rxjs");
const { reduce, scan } = require("rxjs/operators");

const obs$ = of(1, 2, 3, 4, 5);

obs$
  .pipe(
    reduce((acc, x) => {
      return acc + x;
    }, 0)
  )
  .subscribe((x) => console.log("reduce: " + x)); // reduce, 최종 결과인 15만 발행

obs$
  .pipe(
    scan((acc, x) => {
      return acc + x;
    }, 0)
  )
  .subscribe((x) => console.log("scan: " + x)); // scan, 과정인 1, 3, 6, 10, 15가 순차적으로 발행
```

[🔗 rxjs 공식 문서 - scan](https://rxjs.dev/api/operators/scan)

`reduce` : 결과만 발행

`scan` : 과정을 모두 발행

`scan`은 모든 과정 하나 하나를 출력해야할 때 사용 됨

또, 값들을 순차적으로 어떤 배열에 붙여나간다던가, 한 *Object*의 항목에 count가 순차적으로 늘게 만든다던가 다양한 방법으로 사용

## zip Operator

```javascript
const { from, interval, fromEvent, zip } = require("rxjs"); // zip은 rxjs에서 import
const { pluck } = require("rxjs/operators");

const obs1$ = from([1, 2, 3, 4, 5]);
const obs2$ = from(["a", "b", "c", "d", "e"]);
const obs3$ = from([true, false, "F", [6, 7, 8], { name: "zip" }]);

zip(obs1$, obs2$).subscribe(console.log);
```

```javascript
const obs1$ = from([1, 2, 3, 4, 5, 6, 7]);
```

```javascript
const obs4$ = interval(1000);
const obs5$ = fromEvent(document, "click").pipe(pluck("x"));

zip(obs4$, obs5$).subscribe(console.log);
```

[🔗 rxjs 공식 문서 - zip](https://rxjs.dev/api/operators/zip)

`zip`은 `rxjs/operators`가 아니라, `rxjs`에서 *import*함

`zip`은 옷에 달린 지퍼처럼, 마치 양쪽 옷깃을 한곳으로 모아주는 것처럼 여러 `stream`을 한 곳으로 합침

다만, 합쳐진 `stream`은 가장 적은 수를 가진 `Observable`을 기준으로 발행함
