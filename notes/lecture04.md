# Lesson 4 - 내 맘대로 발행하는 Subject

```javascript
const { Subject } = require("rxjs");
const subject = new Subject();

subject.subscribe(console.log);

subject.next(1);
subject.next(3);
subject.next(5);
```

`Subject`는 값이 발행되는 시점을 특별하게 세팅해줘야 하거나, 프로그램의 상태를 _변수_ 대신에 저장할 때에 사용

## Observable과의 차이

### Observable

- 누군가 `구독`을 헤야 발행을 시작
- 각 구독자에게 `따로` 발행
- `unicast`
- `🧊 cold` 발행
- _Netflix_

### Subject

- 개발자가 원하는 때에 발행
- 모든 구독자에게 똑같이 발행
- `multicast`
- `🔥 hot` 발행
- _TV 채널_

```javascript
const { Subject } = require("rxjs");
const subject = new Subject();

setTimeout((_) => {
  let x = 0;
  setInterval((_) => {
    subject.next(x++);
  }, 2000);
}, 5000);

subject.subscribe((x) => console.log("바로구독: " + x));
setTimeout((_) => {
  subject.subscribe((x) => console.log("3초 후 구독: " + x));
}, 3000);
setTimeout((_) => {
  subject.subscribe((x) => console.log("10초 후 구독: " + x));
}, 10000);
setTimeout((_) => {
  subject.subscribe((x) => console.log("14초 후 구독: " + x));
}, 14000);
```

`stream`을 어느 시점에 구독하던 간에, 전송 받는 값은 동일함

`Subject`는 `Observable`과 달리 `hot` 발행이기 때문임

[Subject Example Codes](https://github.com/gloomydumber/rxjsPlayground/blob/master/lectures/subjectExample.js)

## 일반 Observable에 결합하기

기존 코드 (1-1 강에서)

```javascript
const { interval } = require("rxjs");

const obs$ = interval(1000);

obs$.subscribe((x) => console.log("바로구독: " + x));
setTimeout((_) => {
  obs$.subscribe((x) => console.log("3초 후 구독: " + x));
}, 3000);
setTimeout((_) => {
  obs$.subscribe((x) => console.log("5초 후 구독: " + x));
}, 5000);
setTimeout((_) => {
  obs$.subscribe((x) => console.log("10초 후 구독: " + x));
}, 10000);
```

`Subject` 결합 코드

`Subject`를 `Observable`에 `subscriber`로서 넘겨줄 수 있다

```javascript
const { interval, Subject } = require("rxjs");

const subject = new Subject();
const obs$ = interval(1000);

obs$.subscribe(subject); // 이 줄은 아래 주석과 같은 의미이다

/*
obs$.subscribe(x => {
    subject.next(x);
});
*/

subject.subscribe((x) => console.log("바로구독: " + x));
setTimeout((_) => {
  subject.subscribe((x) => console.log("3초 후 구독: " + x));
}, 3000);
setTimeout((_) => {
  subject.subscribe((x) => console.log("5초 후 구독: " + x));
}, 5000);
setTimeout((_) => {
  subject.subscribe((x) => console.log("10초 후 구독: " + x));
}, 10000);
```

⭐ 다른 시기에 구독을 시작한 `Observer`들이 같은 값을 발행받도록 할 때 `Subject`를 사용할 수 있다

## 추가 기능이 있는 Subject

### BehaviorSubject

마지막 값을 저장 후 추가 구독자에게 발행

```javascript
const { BehaviorSubject } = require("rxjs");
const subject = new BehaviorSubject(0); // 초기값이 있음

subject.subscribe((x) => console.log("A: " + x));

subject.next(1);
subject.next(2);
subject.next(3);

subject.subscribe((x) => console.log("B: " + x)); // 3 도 발행함 (추가 구독 직전 마지막 값이라)

subject.next(4);
subject.next(5);
```

`BehaviorSubject`에는 초기값을 설정할 수 있는데, 이 점 때문에 `BehaviorSubject`를 사용하기도 한다

🚨 영상에 나오지 않은 내용 - 아래와 같이 서브젝트가 마지막으로 발행한 값을 얻을 수 있다

```javascript
const lastValue = subject.getValue();
```

⭐️ Section 2의 5강에서 또 다른 사용예를 볼 수 있다

### ReplaySubject

마지막 N개 값을 저장 후 추가 구독자에게 발행

```javascript
const { ReplaySubject } = require("rxjs");
const subject = new ReplaySubject(3); // 마지막 3개 값 저장

subject.subscribe((x) => console.log("A: " + x));

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);
subject.next(5);

subject.subscribe((x) => console.log("B: " + x)); // 3, 4, 5 도 발행함

subject.next(6);
subject.next(7);
```

### AsyncSubject

`Complete` 후의 마지막 값만 발행

```javascript
const { AsyncSubject } = require("rxjs");
const subject = new AsyncSubject();

subject.subscribe((x) => console.log("A: " + x));

subject.next(1);
subject.next(2);
subject.next(3);

subject.subscribe((x) => console.log("B: " + x));

subject.next(4);
subject.next(5);

subject.subscribe((x) => console.log("C: " + x));

subject.next(6);
subject.next(7);
subject.complete(); // A, B, C 구독 모두 Complete 시점에서 마지막 값인 7만 발행
```
