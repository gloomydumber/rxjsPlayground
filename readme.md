# rxjsPlayground

study reactiveX programming with JavaScript...

functional programming style로 깔끔하게 programming 해보자

## reactiveX의 구성 요소

```javascript
const { range } = rxjs;
const { filter, take, map, toArray } = rxjs.operators;

range(1, 20)
  .pipe(
    filter((n) => n % 2 === 0), // 짝수들만 걸러냄
    take(5), // 앞으 5개만 가져옴
    map((n) => Math.pow(n, 2)), // 제곱
    toArray(), // 통과하는 값들을 배열로 모아 내보냄
    map((arr) => arr.join(", "))
  )
  .subscribe(console.log); // 4, 16, 36, 64, 100
```

### Observable

Observable은 일련의 값들을 발행함

관찰될 수 있는 것, 관찰되는 대상이라는 의미

위 예제에서의 `Observable`은 *range(1, 20)*이라는 코드를 통해, 1에서 20까지의 정수를 반환한다

이렇게 연속적으로 발행되어 나오는 값을 `stream`이라 한다

### Operator

이러한 `stream`은 `pipe`를 거치면서 흐르면서, `Operator`(연산자)를 거치게 된다

`Operator`는 _filter_, _map_, _take_ 등의 순수 함수이다

### Observer

`Observer`는 `pipe`를 거친 최종 결과 값을 기다리다가, 최종 작업을 실행함

`Observer`가 `pipe`를 주시하며 발행물을 기다리는 것을 `ReactiveX`에서는 `subscribe`한다고 표현한다

즉, 구독자(`Observer`)가 발행물(`Observable`들이 `pipe`를 거치며 `Operator`의 연산을 거친 값)에 *반응*한다는 의미에서, `Reactive Programming`이라 칭한다

## Why ReactiveX?

*JavaScript*에서 이미 순수 함수 몇 종류들을 지원하고, 또 쉽게 자체적으로 구현할 수 있다

또, _lodash_ 같은 간편한 라이브러리도 존재하는데, 왜 굳이 *ReactiveX*를 통해 프로그래밍을 할까?

*ReactiveX*는 연속된 값들의 흐름인 `stream`을 처리하는 데에 있어서, 평면적인 배열일 뿐인 1차원적인 값들 뿐만 아니라 시간의 흐름, 사용자의 동작, 네트워크 요청의 결과까지 전부 `stream`으로 만들어서 `pipe`를 거쳐 `Operator`를 적용하는 형식으로 프로그래밍 할 수 있다

즉, 시간의 흐름 속에 생겨나는 값들(가령, 원격지의 서버로부터 비동기적으로 받아오는 response값)을 마치 리스트나 배열을 다루듯이 처리할 수 있다

따라서, *ReactiveX*에는 시간에 관련된 순수함수 형태의 다양한 *Operator*들이 존재하고, 각종 비동기 작업, 애니메이션 등에 *ReactiveX*가 유용하게 활용될 수 있다

## ReactiveX를 활용한 비동기 요청 예제

어떤 원격지 서버에 20종류의 *endpoint*가 있고, 해당 _endpoint_ 마다 전부 받아올 수 있는 정보가 다르며 그 정보 각각 모두가 필요한 상황이다

가령 1등 부터 20등 까지 합격인 시험이 있고, 1등 부터 20등의 이름을 반환하는 괴상한 *REST API*가 있다고 가정해보자

게다가, 1등 부터 20등 까지 합격한 사람 이름 모두를 알아야하는 상황에 처해있다고 가정한다

그런데, 이 서버는 상태가 좋지 않아서 응답에 1초 정도 시간이 걸리고, 요청에 대해 25% 확률로 오류를 반환한다

이에, _AJAX_ 요청을 전송할 때 마다 실패 시, 각각 최대 3번 까지 다시 요청을 보내도록 한다

(한 *endpoint*에 대해 1+3번 요청을 보내서 4번 다 실패할 확률은 0.390625% 이다)

비동기적인 *AJAX*이기 때문에 한 번에 각각의 20개의 *endpoint*에 총 20개의 요청 모두를 보낼 수 있지만, 요청을 한거번에 다 보내면 서버가 과부하에 걸릴 수 도 있음을 고려해서 동시에 보내는 요청 또한 4개로 제한해야함을 가정한다

결론적으로, 동시에 4개 요청을 보내되, 실패한 것들이 있으면 실패한 것에 대해서는 최대 3번 같은 요청을 다시 보내고, 성공한 요청이 있으면 해당 _response_ 값을 _array_ 배열 *index*에 맞게 배치한다

요청이 성공했으면, 한번에 4개의 요청을 보낼 수 있으므로, 아직 요청하지 않은 *endpoint*에 대한 요청을 순차적으로 포함하여 항상 최대 4개의 요청을 할 수 있도록 한다

아래는 해당 조건을 *rxjs*로 구현한 것이다

```javascript
const { range } = rxjs;
const { ajax } = rxjs.ajax;
const { mergeMap, toArray, pluck, retry } = rxjs.operators;

range(1, 20).pipe(
    mergeMap(index -> ajax(
        `http://weirdTestResultServer/${index}`
    ).pipe(
        pluck('response', 'first_name'),
        retry(3)
    )
    , 4), // mergeMap의 동시 실행 stream 개수 제한
    toArray()
).subscribe(console.log);
```

우선, `range`를 통해 1 ~ 20까지의 숫자를 `stream`으로 생성

`mergeMap`은 `stream`에서 나온 각 값마다 그 값을 사용하는, 또 다른 `stream`을 생성한다

그 값마다 _ajax_ 요청을 보내는 `stream`을 만들되, 이 `stream`들이 동시에 실행되도록 하되 개수를 제한할 수 있다

상기 코드에서는 한 번에 4개의 `stream`만이 동시에 실행되도록 하였다

이후, *ajax*의 결과값으로 아래 형태의 _json_ 객체로 받아왔다고 가정하자

```json
{
  "response": {
    "first_name": "Alex"
  }
}
```

이러한 _response_ 값을 `pluck`으로 정제한다

먼저, `'response'` 필드를, 거기서 다시 `'first_name'` 필드의 값을 뽑아낸다(`pluck`)

또, 각 요청이 실패했을 때 그것을 N회 재시도하게 하려면 `retry`를 활용한다

이러한 결과 값들은 한 `stream`으로 병합되어서 최종 발행된다

## krtube

### lectures

1. [Observable(Stream 생성기) 만들기](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture01.md)
2. [Observer(구독자)에게 발행물 구독시키기](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture02.md)
3. [Operator 사용해보기](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture03.md)
4. [내 맘대로 발행하는 Subject](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture04.md)
5. [⏰ Scheduler](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture05.md)
6. [기본적인 배열 연산자들](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture06.md)
7. [Transformation 연산자들](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture07.md)
8. [take와 skip 관련 연산자들](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture08.md)
9. [시간을 다루는 연산자들 1](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture09.md)
10. [시간을 다루는 연산자들 2](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture10.md)
11. [스트림을 결합하는 연산자들](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture11.md)
12. [기타 유용한 연산자들 1](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture12.md)
13. [기타 유용한 연산자들 2](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/lecture13.md)

### projects

1. [스마트한 키워드 검색창 만들기](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/project01.md)
2. [애니메이션 그림판 만들기](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/project02.md)
3. [온라인 타자속도 측정기 만들기](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/project03.md)
4. [부록 - 프롬프터 예제 코드](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/project04.md)

### Notes for remind

[rxjs 활용기](https://github.com/gloomydumber/rxjsPlayground/blob/master/notes/remindNotes.md)

## References

https://rxjs-dev.firebaseapp.com/guide/overview

https://www.learnrxjs.io/

https://reactive.how/

https://rxviz.com/
