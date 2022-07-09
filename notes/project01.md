# Project 1 - 스마트한 키워드 검색창 만들기

```html
<script src="https://unpkg.com/@reactivex/rxjs/dist/global/rxjs.umd.js"></script>

<input id="keyword" type="text" />
<br />
<div id="result"></div>
```

```css
body {
  padding: 12px;
  font-family: sans-serif;
}
#keyword {
  width: 200px;
  height: 24px;
  line-height: 24px;
  margin-bottom: 8px;
  padding: 2px 8px;
  border: 2px solid #ccc;
  border-radius: 4px;
}
#result {
  width: 200px;
}
#result article {
  width: 192px;
  height: 30px;
  line-height: 30px;
  padding: 0 12px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  cursor: pointer;
}
#result article:not(:last-child) {
  border-bottom: 0;
}
#result article:first-child {
  border-radius: 4px 4px 0 0;
}
#result article:last-child {
  border-radius: 0 0 4px 4px;
}
#result article:hover {
  background-color: white;
  color: dodgerblue;
}
#result .searching {
  width: 192px;
  height: 30px;
  line-height: 30px;
  padding: 0 12px;
  background-color: dodgerblue;
  color: white;
  border-radius: 4px;
}
```

## Step 1. 검색된 결과값들 보여주기

### 타이핑된 키워드 검색

```javascript
const { fromEvent, from } = rxjs;
const { ajax } = rxjs.ajax;
const {
  mergeMap,
  switchMap,
  pluck,
  retry,
  map,
  scan,
  filter,
  debounceTime,
  distinctUntilChanged,
} = rxjs.operators;

const url = "http://127.0.0.1:3000/people/quarter-error";
const keyword = document.querySelector("#keyword");
const result = document.querySelector("#result");

fromEvent(keyword, "keyup")
  .pipe(
    pluck("target", "value"),
    mergeMap((keyword) => ajax(`${url}?name=${keyword}`).pipe(retry(3))),
    pluck("response")
  )
  .subscribe(console.log);
```

### 결과 하단에 출력

```javascript
function showResults(results) {
  from(results)
    .pipe(
      map((person) => `${person.first_name} ${person.last_name}`),
      map((name) => `<article>${name}</article>`),
      scan((acc, article) => (acc += article), "")
    )
    .subscribe((people) => (result.innerHTML = people));
}
```

### 다음 ajax가 호출되면 이전 과정을 멈추도록

```javascript
fromEvent(keyword, "keyup")
  .pipe(
    pluck("target", "value"),
    // meregeMap 대신 switchMap 사용
    switchMap((keyword) => ajax(`${url}?name=${keyword}`).pipe(retry(3))),
    pluck("response")
  )
  .subscribe(showResults);
```

### 불필요한 Ajax 요청 생략

```javascript
fromEvent(keyword, "keyup")
  .pipe(
    pluck("target", "value"),
    filter((typed) => typed.length > 1), // 1글자 이상일 때만
    debounceTime(500), // 0.5초 공백 후 발행
    distinctUntilChanged(), // 연속된 같은 문자열 생략
    switchMap((keyword) => ajax(`${url}?name=${keyword}`).pipe(retry(3))),
    pluck("response")
  )
  .subscribe(showResults);
```

### 백스페이스를 누를 때 변화한 값으로 검색되지 않도록

```javascript
fromEvent(keyword, "keyup")
  .pipe(
    filter((event) => event.code != "Backspace"), // 백스페이스 생략
    pluck("target", "value"),
    filter((typed) => typed.length > 1),
    debounceTime(500),
    distinctUntilChanged(),
    switchMap((typed) => ajax(`${url}?name=${typed}`).pipe(retry(3))),
    pluck("response")
  )
  .subscribe(showResults);
```

## Step 2. 상태표시 추가

- 스트림을 입력받는 부분과 그 이후의 Ajax 결과로 분리
- 두 스트림의 결과를 `merge`하여 한 subscriber에 적용

```javascript
const { fromEvent, from, merge } = rxjs;
const { ajax } = rxjs.ajax;
const {
  mergeMap,
  switchMap,
  pluck,
  retry,
  map,
  filter,
  debounceTime,
  distinctUntilChanged,
  mapTo,
  scan,
} = rxjs.operators;

const url = "http://127.0.0.1:3000/people/quarter-error";
const keyword = document.querySelector("#keyword");
const result = document.querySelector("#result");
```

```javascript
const searchInit$ = fromEvent(keyword, "keyup").pipe(
  filter((event) => event.code != "Backspace"), // 백스페이스 생략
  pluck("target", "value"),
  filter((typed) => typed.length > 1),
  debounceTime(500),
  distinctUntilChanged()
);
```

```javascript
const searching$ = searchInit$.pipe(
  mapTo('<div class="searching">Searching...</div>')
);
```

```javascript
const searchResult$ = searchInit$.pipe(
  switchMap((keyword) => ajax(`${url}?name=${keyword}`).pipe(retry(3))),
  pluck("response"),
  mergeMap((results) =>
    from(results).pipe(
      map((person) => `${person.first_name} ${person.last_name}`),
      map((name) => `<article>${name}</article>`),
      scan((acc, article) => (acc += article), "")
    )
  )
);
```

```javascript
merge(searching$, searchResult$).subscribe((text) => (result.innerHTML = text));
```
