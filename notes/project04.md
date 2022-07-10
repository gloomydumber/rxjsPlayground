### 부록 - 프롬프터 예제 코드

```javascript
import { of, from, range, fromEvent, merge, concat } from "rxjs";
import {
  pluck,
  filter,
  map,
  mapTo,
  throttleTime,
  startWith,
  bufferCount,
  skipLast,
  toArray,
  scan,
  mergeMap,
} from "rxjs/operators";

export default function init(lines, spaces, printFunc) {
  // 방향키만 1 또는 -1로 치환한 스트림
  const keypress$ = fromEvent(document, "keydown").pipe(
    pluck("key"),
    filter((k) => k.includes("Arrow")),
    map((k) => {
      return {
        ArrowDown: 1,
        ArrowUp: -1,
        ArrowLeft: -1,
        ArrowRight: 1,
      }[k];
    })
  );

  // 마우스 스크롤을 1초 간격으로 끊은 뒤
  // 방향에 따라 1 또는 -1로 치환한 스트림
  const scroll$ = merge(
    fromEvent(document, "mousewheel"),
    fromEvent(document, "wheel")
  ).pipe(
    throttleTime(1000),
    map((s) => (s.deltaY > 0 ? 1 : -1))
  );

  // 위의 키보드 스트림과 마우스 스트림
  // 그리고 최초값 0을 병합한 스트림
  const inputs$ = merge(keypress$, scroll$).pipe(startWith(0));

  // 출력할 첫, 마지막 라인의
  // 각각 앞뒤 공백으로 들어갈 스트림
  const spaces$ = range(0, spaces).pipe(mapTo(""));

  // 프롬프터에 표시할 행들을 앞뒤 공백과 이어붙인 뒤
  // spaces + 1개 라인, 1줄 간격으로 묶어
  // 배열 형태로 반환하는 스트림
  const lines$ = concat(spaces$, from(lines), spaces$).pipe(
    bufferCount(spaces * 2 + 1, 1),
    skipLast(spaces * 2),
    toArray()
  );

  // 인풋 스트림의 입력에 따라 라인 스트림의
  // 1줄 간격으로 묶인 배열을 하나씩 발행하는 최종 스트림
  const final$ = inputs$.pipe(
    scan((acc, cur) => {
      return Math.min(Math.max((acc += cur), 0), lines.length - 1);
    }),
    mergeMap((cursor) => {
      return lines$.pipe(map((buffereds) => buffereds[cursor]));
    })
  );

  // 최종 스트림 구독
  final$.subscribe(printFunc);
}
```
