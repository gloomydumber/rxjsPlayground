# Lesson 2 - Observer(구독자)에게 발행물 구독시키기

`Observer`는 무언가를 관찰하는 것이라는 의미인데, 이는 구독(_subscribe_)한다는 의미에 상응하기에 구독자로 번역하여 이해한다

## Observer - 구독자 만들기

```javascript
const { from } = require("rxjs");
const observable$ = from([1, 2, 3, 4, 5]);
```

`Observable`에는 끝에 `$` (_dollar sign_)을 붙이는게 `ReactiveX`의 관례이다

## 구독자 생성 코드

`Observer`는 자바스크립트 객체(`JSON`) 형태로 구성되어 있고, 세 가지 요소로 이루어져 있다

```javascript
const observer = {
  next: console.log,
  error: (err) => console.error("발행중 오류", err),
  complete: () => console.log("발행물 완결"),
};

observable$.subscribe(observer);
```

`next`는 `stream`에서 오는 값들 하나 하나를 처리하는 함수이다

`error`는 `stream` 진행 중에 발생하는 에러가 있을 경우 이를 처리하는 함수이다

`complete`는 `stream`이 종료되고 난 후에 실행되는 함수이며, `Observable`이 필요한 값들을 전부 발행했다면 `complete`를 통해 완료를 해주어야 해당 `Observable`이 메모리에서 해제가 된다

💡 아래 코드와 같이, 부분적으로만 지정 가능

```javascript
const observer_1 = {
  next: console.log,
  error: (err) => console.error("발행중 오류", err),
};

const observer_2 = {
  next: console.log,
};
```

💡 아래 코드와 같이, 세 개의 인자를 순서를 지켜서 적용 가능

```javascript
observable$.subscribe(
  console.log,
  (err) => console.error("발행중 오류", err),
  (_) => console.log("발행물 완결")
);
```

## Error와 Complete 살펴보기

💡 Error

```javascript
const { Observable } = require("rxjs");

const obs$ = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3)(null)[0]; // 여기서 error 발생
  subscriber.next(4);
});

obs$.subscribe(
  console.log,
  (err) => console.error("발행중 오류", err),
  (_) => console.log("발행물 완결")
);
```

`stream` 진행 중에 `error`가 발생하면, 뒤에 정의된 다른 값들에 대한 `next` 함수가 실행 되지 않으며, `complete` 또한 실행되지 않아 완료되지 않음

💡 Complete

```javascript
const { Observable } = require("rxjs");

const obs$ = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // 실행되지 않음
});

obs$.subscribe(
  console.log,
  (err) => console.error("발행중 오류", err),
  (_) => console.log("발행물 완결")
);
```

`complete`가 되면 `Observable`이 종료되기 때문에 이후의 값을 `next`로 실행하고자 해도 실행 되지 않음

사용이 다 끝 난 `Observable`은 꼭 `complete` 처리하여, 메모리 관리를 할 수 있도록 하는 것이 좋음

## 구독 해제하기

구독을 변수 / 상수로 지정한 뒤 `unsubscribe()` 사용

```javascript
const { interval } = require("rxjs");

const obs$ = interval(1000);
const subscription = obs$.subscribe(console.log);

setTimeout((_) => subscription.unsubscribe(), 5500); // 구독 해제

setTimeout((_) => obs$.subscribe(console.log), 7500); // 새로 구독시 0 부터 stream 진행
```

🌟 `Observable`은 특정 구독자가 새로 구독을 할 때마다 `stream`을 처음 부터 다시 시작함

`Observer`가 하나가 아니라 여럿일 때는 `complete`를 하면, 모든 `stream`이 종료 되므로 `unsubscribe`를 통해 `Observer`를 개별적으로 관리해야할 때 사용
