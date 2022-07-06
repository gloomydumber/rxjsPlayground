# Lesson 1 - Observable(Stream 생성기) 만들기

## 배열된 스트림

```javascript
const { of, from, range, generate } = require("rxjs");

const obs1$ = of(1, 2, 3, 4, 5);
const obs2$ = from([6, 7, 8, 9, 10]);
const obs3$ = range(11, 5);
const obs4$ = generate(
  15,
  (x) => x < 30,
  (x) => x + 2
);

// obs1$.subscribe(item => console.log(`of: ${item}`));
// obs2$.subscribe(item => console.log(`from: ${item}`));
// obs3$.subscribe(item => console.log(`range: ${item}`));
// obs4$.subscribe(item => console.log(`generate: ${item}`));
```

[배열된 스트림](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/array-edStream.js)

## 시간에 의한 스트림

```javascript
const { interval, timer } = require("rxjs");

const obs1$ = interval(1000);
const obs2$ = timer(3000);

obs1$.subscribe((item) => console.log(`interval: ${item}`));
obs2$.subscribe((item) => console.log(`timer: ${item}`));
```

`interval`은 매개변수 시간 간격(_ms_ 단위)으로 값을 _주기적으로_ 반환하는 `stream`을 생성

`time`은 매개변수 시간(_ms_ 단위) 후 값을 반환하는 `stream`을 생성

[시간에 의한 스트림](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/timeStream.js)

## 이벤트에 의한 스트림

```javascript
const { fromEvent } = require("rxjs");

const obs1$ = fromEvent(document, "click");
const obs2$ = fromEvent(document.getElementById("myInput"), "keypress");

obs1$.subscribe((item) => console.log(item));
obs2$.subscribe((item) => console.log(item));

// html에 <input id="myInput" type="text" />라는 element가 있음을 가정
```

`HTML 이벤트`가 일어났을 때의 `stream`생성이 가능

[이벤트에 의한 스트림](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/eventStream.js)

## Ajax를 통한 스트림

```javascript
global.XMLHttpRequest = require("xhr2"); // for Server Side Ajax
const { ajax } = require("rxjs/ajax");

const obs$ = ajax("https://api.github.com/users?per_page=5");
obs$.subscribe((result) => console.log(result.response));
```

위 예제 코드에서는 본래 *browser*에서 지원하는 `Ajax`를 _Node.js_ 상에서 사용하기 위해, `xhr2` 라이브러리를 통해, `rxjs` 라이브러리에 정의된 `XMLHttpRequest` 객체를 따로 지정해주었다

`WebSocket`의 경우도 마찬가지라 아래와 같은 설정이 필요

```javascript
// tslint:disable-next-line
(global as any).WebSocket = require('ws');
```

[Ajax를 통한 스트림](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/ajaxStream.js)

## 직접 만드는 스트림

```javascript
const { Observable } = require("rxjs");

const obs$ = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  // subscriber.complete();
  let i = 4;
  setInterval((_) => subscriber.next(i++), 1000);
});

obs$.subscribe((item) => console.log(item));
```

`next` 함수로 전달된 인자를 발행시켜, `subscribe`를 통해 해당 값을 전달하여 실행한다

[직접 만드는 스트림](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/customStream.js)

## 🌟Observable은 lazy (게으르다)

누군가 `구독`을 해야 발행을 시작

각 구독자에게 `따로` 발행

```javascript
const { of, interval, fromEvent } = require("rxjs");

const obs1$ = of("a", "b", "c");
const obs2$ = interval(1000);
const obs3$ = fromEvent(document, "click");

setTimeout((_) => {
  console.log("of 구독 시작");
  obs1$.subscribe((item) => console.log(item));
}, 5000);

setTimeout((_) => {
  console.log("Interval 구독 시작");
  obs2$.subscribe((item) => console.log(item));
}, 10000);

setTimeout((_) => {
  console.log("fromEvent 구독 시작");
  obs3$.subscribe((item) => console.log("click"));
}, 15000);

setTimeout((_) => {
  console.log("Interval 구독 시작");
  obs2$.subscribe((item) => console.log(item));
}, 20000);
```

[Observable은 lazy](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/lazyObservable.js)

## References

[🔗 rxjs/ajax on Node.js Github Issues](https://github.com/ReactiveX/rxjs/issues/2099)

[🔗 WebSocket 또한 ajax와 같은 Issue 존재](https://github.com/ReactiveX/rxjs/issues/3942)
