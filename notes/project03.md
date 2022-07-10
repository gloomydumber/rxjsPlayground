# Project 3 - 온라인 타자속도 측정기 만들기

```html
<script src="https://unpkg.com/@reactivex/rxjs/dist/global/rxjs.umd.js"></script>

<div id="given"></div>
<input id="input" type="text" /> <button id="start">Start</button>
<br />
<div id="logs"></div>
```

```css
body {
  padding: 16px;
}

#given {
  height: 36px;
}

.loading {
  display: inline-block;
  padding: 3px 12px;
  color: tomato;
  font-size: 0.9em;
  font-weight: bold;
  border: 2px dashed tomato;
  border-radius: 4px;
}
.word {
  color: #333;
  font-size: 1.2em;
  font-weight: bold;
}

#input {
  width: 200px;
  height: 24px;
  line-height: 24px;
  margin-bottom: 8px;
  padding: 2px 8px;
  border: 2px solid #ccc;
  border-radius: 4px;
}
#start {
  color: white;
  background-color: dodgerblue;
  height: 30px;
  line-height: 30px;
  padding: 0 16px;
  border: 0;
  border-radius: 5px;
  outline: none;
}

.average {
  height: 48px;
  line-height: 48px;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #ddd;
}
.average span {
  color: dodgerblue;
}
.score {
  height: 36px;
  line-height: 36px;
  padding: 0 8px;
  font-size: 0.92em;
  border-bottom: 1px solid #eee;
}
.score:nth-child(odd) {
  background-color: #f8f8f8;
}
.score span {
  font-weight: bold;
}
```

### 서버로 부터 임의의 이름 받아오기

```javascript
const { Subject, BehaviorSubject, fromEvent, combineLatest, from } = rxjs;
const { ajax } = rxjs.ajax;
const {
  tap,
  switchMap,
  pluck,
  startWith,
  filter,
  timeInterval,
  map,
  scan,
  reduce,
  skip,
} = rxjs.operators;

const given = document.getElementById("given");
const input = document.getElementById("input");
const start = document.getElementById("start");
const logs = document.getElementById("logs");

const wordSubject = new Subject().pipe(
  tap((word) => (given.innerHTML = `<span class="word">${word}</span>`))
);

const ajaxSubject = new Subject().pipe(
  tap((_) => (given.innerHTML = '<span class="loading">LOADING...<span>')),
  switchMap((_) =>
    ajax("http://127.0.0.1:3000/people/name/random").pipe(
      pluck("response", Math.random() > 0.5 ? "first_name" : "last_name"),
      tap(console.log)
    )
  )
);

ajaxSubject.subscribe((word) => {
  wordSubject.next(null); // 단어가 도착한 순간부터 초를 재기 위함
  wordSubject.next(word);
});

fromEvent(start, "click").subscribe((_) => {
  input.focus();
  ajaxSubject.next();
});
```

### 받아온 이름과 타이핑된 글자 combine

```javascript
combineLatest(
  wordSubject,
  fromEvent(input, "keyup").pipe(
    pluck("target", "value"),
    startWith(null) // 첫 단어 직전의 null과 combine되기 위한 초기값
  )
).subscribe(console.log);
```

### 받아온 이름과 타이핑 된 글자 combine -> 둘이 같을 때 또는 일므을 갓 받아왔을 때 (keyword === null) 발행

```javascript
combineLatest(
  wordSubject,
  fromEvent(input, "keyup").pipe(
    pluck("target", "value"),
    startWith(null) // 첫 단어 직전의 null과 combine되기 위한 초기값
  )
)
  .pipe(
    filter(([keyword, typed]) => {
      console.log(keyword, typed);
      return [typed, null].includes(keyword);
    })
  )
  .subscribe(console.log);
```

### 받아온 이름대로 타이핑 시 입력칸 지우고 새 이름 받아오기

```javascript
combineLatest(
  wordSubject,
  fromEvent(input, "keyup").pipe(
    pluck("target", "value"),
    startWith(null) // 첫 단어 직전의 null과 combine되기 위한 초기값
  )
)
  .pipe(
    filter(([keyword, typed]) => {
      return [typed, null].includes(keyword);
    })
  )
  .subscribe(([keyword, _]) => {
    if (keyword !== null) {
      // 받아온 이름과 타이핑이 일치할 때
      input.value = "";
      ajaxSubject.next();
    }
  });
```

### 이름이 입력될 때 마다의 시간 간격 얻기

```javascript
combineLatest(
  wordSubject,
  fromEvent(input, "keyup").pipe(
    pluck("target", "value"),
    startWith(null) // 첫 단어 직전의 null과 combine되기 위한 초기값
  )
)
  .pipe(
    filter(([keyword, typed]) => {
      return [typed, null].includes(keyword);
    }),
    timeInterval() // 단어가 갓 주어졌을 때 ~ 입력 성공했을 때
  )
  .subscribe((result) => {
    console.log(result.value);
    if (result.value[0] !== null) {
      // 받아온 이름과 타이핑이 일치할 때
      input.value = "";
      ajaxSubject.next();
    }
    printRecords({
      interval: result.interval,
      value: result.value[0],
    });
  });

function printRecords(result) {
  console.log(result);
}
```

### 입력 완료시 마다 내역 쌓고 평균 구하기

```javascript
// function printRecords (result) {
//     console.log(result)
// }
// 대체

const recordSubject = new BehaviorSubject({
  records: [],
  average: null,
}).pipe(
  filter((result) => result.value !== null),
  scan((acc, cur) => {
    acc.records.push(cur);
    from(acc.records)
      .pipe(
        reduce(
          (acc2, cur2) => {
            return {
              lettersTotal: (acc2.lettersTotal += cur2.value.length),
              intervalTotal: (acc2.intervalTotal += cur2.interval),
            };
          },
          {
            lettersTotal: 0,
            intervalTotal: 0,
          }
        )
      )
      .subscribe((result) => {
        acc.average = result.intervalTotal / result.lettersTotal;
      });
    return acc;
  })
);

recordSubject.subscribe(console.log);

function printRecords(result) {
  recordSubject.next(result);
}
```

### 내역과 평균 출력

```javascript
// recordSubject.subscribe(console.log) 대체
recordSubject.pipe(skip(1)).subscribe((result) => {
  logs.innerHTML =
    `<div class="average">Average: <span>${result.average}</span></div>` +
    result.records
      .map((record) => {
        return `<div class="score">${record.value}: <span>${record.interval}</span></div>`;
      })
      .join("");
});
```
