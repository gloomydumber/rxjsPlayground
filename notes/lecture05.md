# Lesson 5 - Scheduler

*ReactiveX*의 요소들은 사용되는 언어마다 형태와 사용법에 있어 다소 차이가 있다

그중에서도 `Scheduler`는 *스레드*에 관련된 것인 만큼, 언어나 환경마다 사용법을 따로 공부해야 할 상세 부분에서 차이가 크기 떄문에 필요시 내용들을 추가할 수 있도록 영상이 아닌 페이지 게시물로 따로 정리

## Scheduler

`Scheduler`를 간단히 설명하자면 *Observable이나 Operator, Subscriber가 멀티스레딩 환경에서 어느 스레드상에 실행될지*를 정하는 것이다

- 🚀\_ 지금 뭐가 진행되고 있든 이 작업을 지금 당장 실행해버릴지
- 🐇\_ 현재 진행되고 있는 작은 작업을 마치는대로 최대한 빨리 실행할지
- 🐌\_ 느긋하게 맨 뒤로 밀어서, 하고 있는 일들을 다 마치고 실행할지
- ⏰\_ 특정 시간을 정해서 때가 되면 실행할지

이런 것들을 정해주는 것이 `Scheduler`이다

지정할 수 있는 `Scheduler`의 종류는 언어마다의 스레딩 환경에 따라 다르다

_ReactiveX_ 공식 홈페이지에서 언어별 명세를 펼쳐보면 _RxJava_ 등과 같이 사용 가능한 `Scheduler`와 자세한 설명이 기재된 것들도 있지만 _RxKotlin_ 등과 같이 _TBD (To Be Determined)_ 상태로 추후에 작성할 것을 예고한 상태에 머물러 있는 것들도 있다

후자의 경우 각각의 도큐먼트를 따로 검색해보는 수고가 필요하다

*ReactiveX*의 연산자들은 각각 기본적으로 설정된 `Scheduler`(`Scheduler 없음` 포함)가 있다

_ReactiveX_ 공식 홈페이지의 *언어별 명세*에서 *RxJava*란을 펼쳐보면 연산자들에 각각의 특성에 적합한 `Scheduler`가 기본적으로 부여되어 있는 것을 볼 수 있다

예를들어,

- `debounce`처럼 콜백이 이벤트 루프를 돌아 지연 처리되는 연산자는 `computation`
- `timestamp`나 `timeInterval`처럼 발행 즉시 구독자에게 넘겨지는 연산자는 `immediate`
- `repeat`처럼 대기중인 큐가 다 처리된 다음 실행되는 연산자에는 `trampoline`

위와 같이 부여된 것을 볼 수 있다 (윗 부분에 각각에 대한 설명이 있다)

*Rxjs*의 경우 [이 페이지](https://rxjs.dev/guide/scheduler)에서 각 `Scheduler`들을 확인할 수 있다

| Rxjs용 스케쥴러         | 설명                                                                                                           |
| :---------------------- | :------------------------------------------------------------------------------------------------------------- |
| null                    | 스케줄러 없음. 동기적으로 또는 재귀적으로 사용되는 연산자에 이용                                               |
| queueScheduler          | 새 작업을 현재의 작업(task) 대기줄 맨 끝에 세움. 반복 연산자에 사용                                            |
| asapScheduler           | Promise에 사용되는 것과 동일 - 현 소작업(microtask)이 끝나고 그 다음 소작업을 하기 전 실행. 비동기 작업에 사용 |
| asyncScheduler          | setInterval과 함께 사용됨. 시간 관련 연산자에 사용                                                             |
| animationFrameScheduler | 브라우저가 내용을 새로 그리기(repaint) 전 실행됨. 부드러운 애니메이션을 위해 사용                              |

이러한 `Scheduler`들을 파이프에 적용하기 위해 언어들마다 공통적으로 사용되는 연산자들을 아래 둘이 있다

| 연산자      | 설명                                                    |
| :---------- | :------------------------------------------------------ |
| SubscribeOn | 옵저버블 또는 이를 처리할 연산자를 실행할 스케줄러 지정 |
| ObserverOn  | 구독자에게 알림을 보낼 때 사용할 스케줄러 지정          |

## Examples

```javascript
const { of, asyncScheduler } = require("rxjs");
const { subscribeOn, observeOn, tap } = require("rxjs/operators");

const tapper = (x) => console.log(`${x} IN`);
const observer = (x) => console.log(`${x} OUT`);

of(1, 2, 3).pipe(tap(tapper), subscribeOn(asyncScheduler)).subscribe(observer);

of(4, 5, 6).pipe(tap(tapper)).subscribe(observer);

of("A", "B", "C")
  .pipe(tap(tapper), observeOn(asyncScheduler))
  .subscribe(observer);

of("D", "E", "F").pipe(tap(tapper)).subscribe(observer);
```

위의 예제에서 숫자 1, 2, 3을 발행하는 `Stream`과 문자 'A', 'B', 'C'를 발행하는 `Stream`에, 각 발행물을 현재의 마이크로테스크 다음에 발행하도록 하는 `asyncScheduler`를 적용함

때문에 각각은 4, 5, 6과 'D', 'E', 'F' 보다 다음에 나옴

차이가 있다면, 1, 2, 3은 `subscribeOn`을 써서 구독, 즉 옵저버블이나 연산자가 실행되는 시점부터 해당 스케줄러를 지정했다

그리고, 'A', 'B', 'C'는 `observeOn`을 사용해서 이들이 구독자에게 전달되는 시점만 async로 동작하도록 했다

때문에 전자는 tap('~IN')되는 동작까지 모두 4, 5, 6 보다 늦게 나온 반면, 후자는 tap 부분은 먼저 출력되고 subscribe('~ OUT') 되는 부분만 'D', 'E', 'F' 보다 나중에 출력된 것이다

## References

[🔗 ReactiveX 공식 문서 - Scheduler](https://reactivex.io/documentation/ko/scheduler.html)

[🔗 rxjs 공식 문서 - Scheduler](https://rxjs.dev/guide/scheduler)
