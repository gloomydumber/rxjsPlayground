# Lecture 6 - 기본적인 배열 연산자들

## 산수 관련 Operator

`count`, `max`, `min`, `reduce`

```javascript
const { of } = require("rxjs");
const { count, max, min, reduce } = require("rxjs/operators");

const obs$ = of(4, 2, 6, 10, 8);

obs$.pipe(count()).subscribe((x) => console.log("count: " + x)); // 몇개가 들어 있는가
obs$.pipe(max()).subscribe((x) => console.log("max: " + x)); // 가장 큰 값
obs$.pipe(min()).subscribe((x) => console.log("min: " + x)); // 가장 작은 값
obs$
  .pipe(
    reduce((acc, x) => {
      return acc + x;
    }, 0)
  )
  .subscribe((x) => console.log("reduce: " + x)); // 누적 값 연산
```

[🔗 rxjs 공식 문서 - count](https://rxjs.dev/api/operators/count)

[🔗 rxjs 공식 문서 - max](https://rxjs.dev/api/operators/max)

[🔗 rxjs 공식 문서 - min](https://rxjs.dev/api/operators/min)

[🔗 rxjs 공식 문서 - reduce](https://rxjs.dev/api/operators/reduce)

*JavaScript*의 _Math_ 객체로도 다 할 수 있는데 굳이 *rxjs*로 처리 해야하는 이유는,

`pipe` 안에서 다른 `Operator`들과 함께 사용하기 때문에, 적재적소에 유용하게 쓸 수 있기 때문이다

## 선택 관련 Operator

`first`, `last`, `elementAt`, `distinct`, `filter`

```javascript
const { from } = require("rxjs");
const { first, last, elementAt, filter, distinct } = require("rxjs/operators");

const obs$ = from([
  9, 3, 10, 5, 1, 10, 9, 9, 1, 4, 1, 8, 6, 2, 7, 2, 5, 5, 10, 2,
]);

obs$.pipe(first()).subscribe((x) => console.log("first: " + x)); // 첫 번째 깞
obs$.pipe(last()).subscribe((x) => console.log("last: " + x)); // 마지막 값
obs$.pipe(elementAt(5)).subscribe((x) => console.log("elementAt: " + x)); // n 번째 값
obs$.pipe(distinct()).subscribe((x) => console.log("distinct: " + x)); // 중복 제거 후 하나 씩 출력
obs$
  .pipe(filter((x) => x % 2 === 1))
  .subscribe((x) => console.log("filter: " + x)); // 조건에 부합하는 값 출력
```

가령, `pipe`에서 `distinct`와 `count`를 연결하면, 중복없는 원소들의 개수를 반환 받을 수 있다

[🔗 rxjs 공식 문서 - first](https://rxjs.dev/api/operators/first)

[🔗 rxjs 공식 문서 - last](https://rxjs.dev/api/operators/last)

[🔗 rxjs 공식 문서 - elementAt](https://rxjs.dev/api/operators/elementAt)

[🔗 rxjs 공식 문서 - distinct](https://rxjs.dev/api/operators/distinct)

[🔗 rxjs 공식 문서 - filter](https://rxjs.dev/api/operators/filter)

### 🎯 활용해보기

위의 숫자들 중

- 짝수들 중에서 가장 큰 수 (`filter`로 2를 나눈 나머지가 0인 것들 중에서 `max`)
- 5보다 큰 3번째 짝수 (`filter`로 5보다 큰 것들 중 2를 나눈 나머지가 0인 것들 중에서 `elemntAt`의 2)
- 한 번 이상 나온 홀수들의 개수, 합 (`distinct`를 해준 후, `filter`로 2로 나눈 것이 1인 것들을 `count`하면 개수, 합의 경우 `reduce`)

## tap Operator

```javascript
const { from } = require("rxjs");
const { tap, filter, distinct } = require("rxjs/operators");

from([9, 3, 10, 5, 1, 10, 9, 9, 1, 4, 1, 8, 6, 2, 7, 2, 5, 5, 10, 2])
  .pipe(
    tap((x) => console.log("-------------- 처음 탭: " + x)),
    filter((x) => x % 2 === 0),
    tap((x) => console.log("--------- 필터 후: " + x)),
    distinct(),
    tap((x) => console.log("중복 제거 후: " + x))
  )
  .subscribe((x) => console.log("발행물: " + x));
```

- `pipe`에 물이 흐르는데 손으로 툭툭 쳐본다라는 의미에서의 `tap`으로 이해
- 디버깅의 용도로도 사용할 수 있음
- 부작용을 일으킬 수 있는 작업도 할 수는 있으나 지양됨
- 통과되는 모든 값마다 특정 작업을 수행
- ⭐ 발행 결과에 영향을 주지 않음

## References

[🔗 rxjs 공식 문서 - Operators](https://rxjs-dev.firebaseapp.com/guide/operators)
