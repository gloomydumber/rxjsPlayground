# Notes for remind

_rxjs_ 를 활용하면서 느낀 점이나 _trial and error_ 등을 상기하기위해서 작성 <!-- `rxjs` -->

## poop

Shitty business logic code style

```javascript
merge(bpipe, upipe)
  .pipe(
    scan((acc, value) => {
      //   const y = Object.assign({}, acc, value);
      const key = Object.keys(value)[0];
      //   console.log(value, key, value[key]);
      //   Object.assign(acc, value);
      if (!acc[key]) {
        Object.assign(acc, value);
      } else if (value[key]["KRWprice"]) {
        acc[key]["KRWmarket"] = value[key]["KRWmarket"];
        acc[key]["KRWprice"] = value[key]["KRWprice"];
      } else {
        acc[key]["USDTmarket"] = value[key]["USDTmarket"];
        acc[key]["USDTprice"] = value[key]["USDTprice"];
      }

      return acc;
    }, {})
  )
  .subscribe((x) => console.log(x));
```

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

## interval에 관해 (✔️)

`interval`의 경우는 `stream`의 최초 시작 시점 부터 즉시 발행하는 것이 아니라, `interval`의 간격으로 주어진 매개변수 시간이 흐른 뒤에 실행된다.

```javascript
setInterval(() => {
  console.log("2s later first see and then...");
}, 2000);
```

가령 위 코드는 처음 코드 실행 시에는 `console.log`가 실행되지 않고, 2초 후 부터 실행되기 시작해서 2초 간격으로 실행된다

### ✔️ Resolved

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

## retry에 관해 2

`retry`를 하면 새로운 `stream`으로 여겨져서 기존 `streram`과는 별개인지 의문

가령 `combineLatest`를 통해 구독중에 있던 `Observable` 내지는 `Subject`가 `retry`를 통해 재연결을 하였다면 계속 정상 동작하는가?

## switchMap에 관해

n초 마다 `ajax` 요청을 하는 데에 있어서 `switchMap`을 쓰는 편이 옳지 않은지?

또, `retry`나 `catchError`를 하지 않으면 `Observable` 자체가 `error`로 종료되지 않는지?

```javascript
const obs$ = timer(0, 2000).pipe(
  mergeMap(
    () =>
      ajax(
        "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
      ).pipe(pluck("response", 0, "basePrice")) // switchMap, retry (or catchError)
  )
);
```

## defer에 관해

`defer`를 통해 분기를 나눠 각기 다른 `observable`로 분할해 발행할 수 있다

```javascript
const bpipe = subjectBinance;

bpipe.subscribe((x) => {
  defer(() =>
    x.s === "BTCUSDT"
      ? of({ market: x.s, price: Number(x.c), usdt: Math.random() })
      : of({ market: x.s, price: Number(x.c) })
  ).subscribe(console.log);
});
```

## combineLatest에 관해 (✔️)

```javascript
combineLatest({ bpipe, upipe, obs$ }) // Javascript Object format Combine
  .pipe(
    map((x) =>
      Object.assign(x, {
        premium: 100 - ((x.bpipe.price * x["obs$"]) / x.upipe.price) * 100,
      })
    )
  )
  .subscribe((x) => console.log(x));
```

위 코드와 같이 _Javascript Object Format_ 으로 `combineLatest`를 사용하게 되면 발행 값들의 *key*가 해당 `Observable` 변수명이된다

가령 위 코드는

```javascript
{
    bpipe: { market: 'BTCUSDT', price: 20081.75 },
    upipe: { market: 'KRW-BTC', price: 26650000 },
    'obs$': 1324
}
```

이와 같은 형식으로 출력된다. *as*처럼 동작해서 _key_ 값을 유저가 설정할 수 있도록 할 수 없는지 의문

### ✔️ Resolved

```javascript
combineLatest({ binance: bpipe, upbit: upipe, usd: obs$ });
```

와 같이 인자를 전달하면,

```javascript
{
    binance: { market: 'BTCUSDT', price: 20081.75 },
    upbit: { market: 'KRW-BTC', price: 26650000 },
    usd: 1324
}
```

로 _key_ 값을 변경할 수 있다

## repeat에 관해

```javascript
const usd = timer(0, 3000).pipe(
  switchMap(() =>
    ajax(
      "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD"
    ).pipe(
      pluck("response", 0, "basePrice"),
      map((x) => ({ usdPrice: x })),
      retry({
        delay: (err, x) =>
          of(x).pipe(
            tap((x) => {
              bot.sendMessage(
                errChatID,
                `Fethcing USD\n retry operator ${x} times activated\n at : ${getDate()}`,
                { parse_mode: "markdown" }
              );
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL))
          ),
      })
    )
  )
);
```

와 같이 이미 `timer`를 통해 반복적인 `ajax` 요청을 할 때에는 `repeat`을 사용할 필요 없음

`timer` 쓰지 않고 `repeat` 바로 쓰는게 맞을지도

## JavaScript Object Key 값을 변수로 하고 싶은 경우

```javascript
let keyName = "I AM KEY";
let obj = {
  [keyName] : "value here";
}
```

와 같이 작성하면 *Object*의 *Key*를 변수의 값으로 할당 가능하다

## cold vs hot Observable에 관해

cold, 즉, 내부에서 ws를 연결해야 retry가 가능해보임? <- 시도 필요

## modeling

![drawio](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/drawio.png)

![usdtcalculation](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/fluid.png)

우선 생각나는대로 휘갈겨 써봄

USD fetch 및 catchError

Upbit / Binance Websocket Subject

우선, BTC를 먼저 stream 생성 (이는 아랫줄의 USDT 계산을 위함), 이후 각 ticker 별로 stream 생성 후 combineLatest

USDT 계산 (즉, 일단 BTC 기준으로의 premium 이 계산되고 나서야 이후 premium 들을 계산할 수 있음) - USDT 계산을 어떻게 할 것인가? defer ? iif ? 분기나누기?

Upbit는 Subscribe 와 동시에 해당 ticker들의 가격 조회가 가능하나, Binance의 경우는 tick이 발생해야 해당 ticker의 가격정보가 수신됨 (연결 즉시 1회 일괄적으로 가격을 조회할 수 있는지 방법 고안)

그 이후 각각 dollar premium 및 tether premium 계산

기준 index 초과시 알림

USDT 계산 부분을 그냥 ajax로 할지 고민중

## on session

```
// {ticker: "BTC/KRW", price: 31150000}
// upbitBTC ---------------------   calculateUsdtExchangeRate {KRW/USDT: 1312} <--- 얘가하나의 observable
// {ticker: "BTC/USDT", price: 23730} |  -----------
// binanceBTC------------------------> combineLatest| ---
//                                     -------------     |
// {ticker: "XRP/KRW", price: 300}                       |      calculateCoinPremium {ticker: "XRP", upbitPrice: 300, binancePrice: 3, usdtPremium: 4, usdPremium: 3}
// upbitXRP ---------------------------------------------+        ---------------
// {ticker: "XRP/USDT", price: 3}                        |---->  | combineLatest |
// binanceXRP -------------------------------------------+        ---------------
// {usdPrice: 1310}                                      |
// dollar------------------------------------------------       calculateBTCPremium {ticker: "BTC", upbitPrice: 123213, binancePrice: 12340, usdtPremium: 0, usdPremium: usdtPremium}
```

```javascript
// 2 가지방법

// 1. 그냥 USDT 계산 안하고 USD 프리미엄으로만 처리 -> 로직이 아주 간단해지나, 비트코인 대비 상대적인 프리미엄 계산이 어려울 수 있음
// 이 경우, 달러 프리미엄이 3~4 % 상수로서 존재할 때 auto-lender는 동작하지 않아야함

// 2. USDT 프리미엄 계산 로직
// 우선 모든 Ticker 각각 양 거래소를 combineLatest 실시
// 발행물을 두 경우 조건문으로 제어함

// 첫 번째 경우 - Ticker가 BTC일 경우
// USDT 값을 계산하여 속성으로 같이 부여하여 발행

// 두번째 경우 - Ticker가 BTC이외의 경우
// 두번째 경우의 첫번째 케이스 : USDT가 계산되지 않은 경우 - 아무것도 발행하지않음
// 두번째 경우의 두번째 케이스 : USDT가 계산된 경우 - USDT프리미엄 값을 계산하여 속성으로 같이 부여하여 발행

// 첫번째 경우 예시
{
  upbit: { market: "KRW-BTC", price: 30000000 },
  binance: { market: "BTCUSDT", price: 29300 }
}
// 과 같이 수신되었을때, Ticker가 BTC인 경우이므로,

{
  upbit: { market: "KRW-BTC", price: 30000000 },
  binance: { market: "BTCUSDT", price: 29300 },
  usdt: 1324.24
}
// 로 usdt field 부여하여 발행

// 두번째 경우 예시
{
  upbit: { market: 'KRW-SRM', price: 1460 },
  binance: { market: 'SRMUSDT', price: 1.126 }
}

// 와 같이 Ticker가 BTC가 아닌 경우 이므로,
// 이 경우, 만약 아직 usdt가 앞서 BTC의 수신으로 계산되지 않았다면 발행 x
// 계산되었다면,

{
  upbit: { market: 'KRW-SRM', price: 1460 },
  binance: { market: 'SRMUSDT', price: 1.126 },
  usdtPremium : -3.2
}

// 와 같이 usdtPremium field 부여하여 발행
```

```javascript
우선은 Ticker는 수기작성
업비트 웹소켓 / 바인낸스 웹소켓 / 달러정보
프리미엄 발생 시 Telegram Notify

1. 바이낸스 업비트에서 무작위로 오는 아래의 거래 정보를 같은 ticker끼리
combineLatset로 묶어준다
이 때, BTC인 종목도 수신되고, non-BTC로도 수신되지만 일단 같은 ticker끼리는 묵는다
이를 const pairedSameTickerObs$; 로 선언
가령, 객체를 한 단위로 다음과 같은 format으로 수신 됨
{
 upbit : { market: 'KRW-BTC', price: 30698000 },
 binance : { market: 'BTCUSDT', prcie: 23152.33 }
}
{
  upbit: { market: 'KRW-ETC', price: 50940 },
  binance: { market: 'ETCUSDT', price: 38.43 }
}

2. pairedSameTickerObs$에서, BTC와 non-BTC를 분리하여 Observable을 생성해 준다.
2-1-1. const btcObs$에서는 아래와 같은 단위 수신
{
 upbit : { market: 'KRW-BTC', price: 30698000 },
 binance : { market: 'BTCUSDT', prcie: 23152.33 }
}
2-1-2. 해당 내용을 통해 usdt 필드를 생성해서 계산하여 추가하여 발신한다.
{
  upbit : { market: 'KRW-BTC', price: 30698000 },
  binance : { market: 'BTCUSDT', prcie: 23152.33 }
  usdt: 1325.91
}
최종적으로 btcObs$에서는 위의 구조의 객체 형태로 발신

2-2-1. const nonBtcObs$에서는 아래와 같은 단위 수신
{
  upbit: { market: 'KRW-ETC', price: 50940 },
  binance: { market: 'ETCUSDT', price: 38.43 }
}
2-2-2. 위의 2-1-2에서의 usdt 정보를 이용해야하므로, 2-1-2와 combineLatest로 묶어준다.
이에,
{
  upbit: { market: 'KRW-ETC', price: 50940 },
  binance: { market: 'ETCUSDT', price: 38.43 },
  usdtPremium : 3.21%
}
와 같이 발행해준다.
(cf. 구조분해할당)
최종적으로 nonBtcObs$에서는 위의 구조의 객체 형태로 발신

4. 최종 수신 형태 finalObs$는 1의 pairedSameTickerObs$처럼 btc와 nonBtc 모두가 수신되나,
btc의 경우
upbit 필드, binance 필드, usdt 필드 모두 존재하고 값을 지닌다
non-btc의 경우
upbit 필드, binance 필드, usdtPremium 필드 모두 존재하고 값을 지닌다
{
 upbit : { market: 'KRW-BTC', price: 30698000 },
 binance : { market: 'BTCUSDT', prcie: 23152.33 },
 usdt: 1325.91
}
{
  upbit: { market: 'KRW-ETC', price: 50940 },
  binance: { market: 'ETCUSDT', price: 38.43 }
  usdtPremium: 3.21%
}

이를 위해, 2-1-2의 btcObs$와 2-2-2의 nonBtcObs$를 merge한것이 finalObs$
```

## to do list

( + 고민 리스트)

filterTickers에서, 격리 margin 지원되는 것만 추출하도록 한번더 filter

ajax에 repeat도 해줄 필요가 있나? (timer 에 들어있어서 해줄 필요 없어보임)

upbitWS의 경우, uuid 및 구독정보를 연결후에 보내준뒤에서야 발신을 시작하기 때문에 pipe에 제약

wsReconnection에서 multicast 구현 및 share 해보기 (이를 바탕으로 stackoverflow 자문자답)

ip 관련 (https://www.100mb.kr/bbs/board.php?bo_table=customer&wr_id=305854, https://www.100mb.kr/bbs/board.php?bo_table=customer&wr_id=441455)

## References

[🔗 hot vs cold Observables](https://benlesh.medium.com/hot-vs-cold-observables-f8094ed53339)
