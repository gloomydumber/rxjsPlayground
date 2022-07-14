# Notes for remind

_rxjs_ 를 활용하면서 느낀 점이나 _trial and error_ 등을 상기하기위해서 작성 <!-- `rxjs` -->

## tap에 관해

`tap`은 공식 문서에서도 아래와 같이 정의되며 _"outside" state_ 에 영향을 주고 싶을 때에 사용할 수 있다고 정의되어있다.

> Used when you want to affect outside state with a notification without altering the notification

먼저, *side effect*란 단순히 번역하면 *부작용*이라는 뜻이지만, 정확히는 어떠한 상태가 변화하는 것을 일컫는다.

또는, _return_ 값과는 별개로 발생하는 프로그램의 상태 변경을 의미한다.

다시 본론으로 돌아가서, 공식 문서에 정의된 `tap`에 대한 내용에 따르면,

`tap`은 외부 상태에 *side effect*를 가할 수 있다는 의미인데, 외부가 아닌 `stream` 내부의 상태에 *side effect*를 불러일으키는 것에 대해서는 어떨까?

`tap`을 통해서 내부 상태에도 이러한 부작용을 일으키는 작업을 할 수는 있다.

다만, 내부 상태에 부작용을 일으키는 작업은 지양된다.

왜 지양되는가?는 좀 더 알아봐야 할 것 같으나,

단순히 원래 `tap` 을 외부 상태에 영향을 끼치고자 할 때 사용하도록 구현한 `operator` 이기 때문일 것이라고 추측한다.

이미 내부 상태는 `map`, `mergeMap` 등으로 _(rxjs tap operator document에도 이러한 뉘앙스?의 설명이 있다)_ 영향을 끼치고 있기 때문에, 따로 이름을 정의해서 만들어 준 것 같다.

`ReactiveX` 에서는 `do`로 정의되어있는데, `rxjs`에서는 `do` 와 `tap` 모두 같은 동작을 한다.

아래는 예제 코드다

### tap의 경우

```javascript
combineLatest({ bpipe, upipe })
  .pipe(
    tap((x) =>
      Object.assign(x, {
        premium: 100 - ((x.bpipe.price * 1312.5) / x.upipe.price) * 100,
      })
    )
  )
  .subscribe((x) => console.log(x));
```

### map의 경우

```javascript
combineLatest({ bpipe, upipe })
  .pipe(
    map((x) =>
      Object.assign(x, {
        premium: 100 - ((x.bpipe.price * 1312.5) / x.upipe.price) * 100,
      })
    )
  )
  .subscribe((x) => console.log(x));
```

사실 자연스럽게 당연히 이와 같이 `map` 을 사용해야겠다는 생각이 떠오르는 것이 당연할 것이다

굳이 `tap`을 이용해보았고, 결과는 동일하게 동작을 해서 의문이 생긴 문제였다.

출력은 두 코드 모두 아래와 같이 잘 동작한다

```javascript
{
  bpipe: { market: 'BTCUSDT', price: 19938.81 },
  upipe: { market: 'KRW-BTC', price: 26406000 },
  premium: 0.8949173483299262
}
```

아직 지양되는 이유 등을 정확한 documentation 등으로는 확인하지 못해 의문이 완전 풀리지는 않았다고 해야겠다.

## interval에 관해

`interval`의 경우는 `stream`의 최초 시작 시점 부터 즉시 발행하는 것이 아니라, `interval`의 간격으로 주어진 매개변수 시간이 흐른 뒤에 실행된다.

```javascript
setInterval(() => {
  console.log("2s later first see and then...");
}, 2000);
```

가령 위 코드는 처음 코드 실행 시에는 `console.log`가 실행되지 않고, 2초 후 부터 실행되기 시작해서 2초 간격으로 실행된다

코드의 최초 실행 부터 `stream`을 발행하기 위해서는 `timer`를 사용해야 한다

```javascript
timer(0, 2000).subscribe(console.log);
```

가령 위 코드는 처음 부터 console.log가 실행되고 2초 간격으로 계속 실행된다

## retry에 관해

`rxjs 6` _implementation_ 으로 다음과 같은 `WebSocket` _reconnection_ 시도도 가능해졌다

```javascript
import { webSocket } from 'rxjs/webSocket'
import { retry, RetryConfig } from "rxjs/operators";

const retryConfig: RetryConfig = {
  delay: 3000,
};

let subject = webSocket('ws://localhost:8081');
subject.pipe(
   retry(retryConfig) //support auto reconnect
).subscribe(...)
```

## modeling

![drawio](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/drawio.png)

우선 생각나는대로 휘갈겨 써봄

USD fetch 및 catchError

Upbit / Binance Websocket Subject

우선, BTC를 먼저 stream 생성 (이는 아랫줄의 USDT 계산을 위함), 이후 각 ticker 별로 stream 생성 후 combineLatest

USDT 계산 (즉, 일단 BTC 기준으로의 premium 이 계산되고 나서야 이후 premium 들을 계산할 수 있음)

Upbit는 Subscribe 와 동시에 해당 ticker들의 가격 조회가 가능하나, Binance의 경우는 tick이 발생해야 해당 ticker의 가격정보가 수신됨 (연결 즉시 1회 일괄적으로 가격을 조회할 수 있는지 방법 고안)

그 이후 각각 dollar premium 및 tether premium 계산

기준 index 초과시 알림

```
// BTC, XRP ...                                                                                                           괴리 포착기 (subscriber), merge된 subject 1개만 받아서
//===binance==>  A ===> filter(BTC) ====> { Bprice : 23 } ==> |----------------------------------------------|
//                                                            | combinelatest{Bprice: W, Uprice: W, Gap: 4}  |  ====|
//===Upbit====> 1 ====> filter(BTC) ====> { Uprice : 12 } ==> |----------------------------------------------|      |             |-------------------|
//                                                                                                                  |====merge===>|  대출 해줘        |===>
//===binance==>  B ===> filter(XRP) ====> { Bprice : 44 } ==> |----------------------------------------------|      |             |-------------------|
//                                                            | combinelatest{Bprice: W, Uprice: W, Gap: 4}  |  ====|
//===Upbit====> 2 ====> filter(XRP) ====> { Uprice : 11 } ==> |----------------------------------------------|
// stateless
```
