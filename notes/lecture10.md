# Lesson 10 - 시간을 다루는 연산자들 2

## 시간을 다루는 Operator 2

### 준비코드

```javascript
const { fromEvent } = require("rxjs");
const { timeInterval, pluck, scan, tap } = require("rxjs/operators");

const clicks$ = fromEvent(document, "click").pipe(
  timeInterval(),
  pluck("interval"),
  scan((acc, i) => acc + i, 0),
  tap((x) => console.log("CLICKED: " + x))
);

clicks$.subscribe();
```

### debounceTime

![debouncetime](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/debouncetime.png)

```javascript
const { debounceTime } = require("rxjs/operators");

clicks$
  .pipe(debounceTime(1000))
  .subscribe((x) => console.log("OUTPUT: -------- " + x));
```

[🔗 rxjs 공식 문서 - debounceTime](https://rxjs.dev/api/operators/debounceTime)

### auditTime

![audittime](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/audittime.png)

```javascript
const { auditTime } = require("rxjs/operators");

clicks$
  .pipe(auditTime(1000))
  .subscribe((x) => console.log("OUTPUT: -------- " + x));
```

[🔗 rxjs 공식 문서 - auditTime](https://rxjs.dev/api/operators/auditTime)

### sampleTime

![sampletime](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/sampletime.png)

```javascript
const { sampleTime } = require("rxjs/operators");

clicks$
  .pipe(sampleTime(1000), timeInterval())
  .subscribe((x) =>
    console.log("OUTPUT: -------- " + x.value + " :" + x.interval)
  );
```

[🔗 rxjs 공식 문서 - sampleTime](https://rxjs.dev/api/operators/sampleTime)

### throttleTime

![throttletime-leading](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/throttletime-leading.png)

default

```javascript
const { throttleTime } = require("rxjs/operators");

clicks$
  .pipe(
    throttleTime(1000, undefined, {
      leading: true,
      trailing: false,
    })
  )
  .subscribe((x) => console.log("OUTPUT: -------- " + x));
```

[🔗 rxjs 공식 문서 - throttleTime](https://rxjs.dev/api/operators/throttleTime)

![throttletime-trailing](https://github.com/gloomydumber/rxjsPlayground/blob/master/img/throttletime-trailing.png)

```javascript
const { throttleTime } = require("rxjs/operators");

clicks$
  .pipe(
    throttleTime(1000, undefined, {
      leading: false,
      trailing: true,
    })
  )
  .subscribe((x) => console.log("OUTPUT: -------- " + x));
```

- `auditTime` 과의 차이?

```javascript
const { throttleTime } = require("rxjs/operators");

clicks$
  .pipe(
    throttleTime(1000, undefined, {
      leading: true,
      trailing: true,
    })
  )
  .subscribe((x) => console.log("OUTPUT: -------- " + x));
```

## ~Time 이 붙지 않은 연산자들

### debounce

```javascript
const { fromEvent, interval } = require("rxjs");
const { debounce, audit, pluck } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(
    pluck("y"),
    debounce((y) => interval(y * 10))
  )
  .subscribe(console.log);
```

```javascript
const { BehaviorSubject, fromEvent, interval } = require("rxjs");
const { debounce, tap } = require("rxjs/operators");

const bs = new BehaviorSubject(1000);

fromEvent(document, "click")
  .pipe(
    tap((_) => console.log(bs.getValue())),
    debounce((e) => interval(bs.getValue())),
    tap((_) => bs.next(bs.getValue() + 500))
  )
  .subscribe((_) => console.log("CLICK"));
```

[🔗 rxjs 공식 문서 - debounce](https://rxjs.dev/api/operators/debounce)

### audit

```javascript
fromEvent(document, "click")
  .pipe(
    pluck("y"),
    audit((y) => interval(y * 10))
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - audit](https://rxjs.dev/api/operators/audit)

### sample

```javascript
const { fromEvent, interval } = require("rxjs");
const { sample } = require("rxjs/operators");

interval(1000)
  .pipe(sample(fromEvent(document, "click")))
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - sample](https://rxjs.dev/api/operators/sample)

### throttle

```javascript
const { fromEvent, interval } = require("rxjs");
const { throttle, timeInterval, pluck } = require("rxjs/operators");

fromEvent(document, "click")
  .pipe(
    throttle((e) => interval(1000)),
    timeInterval(),
    pluck("interval")
  )
  .subscribe(console.log);
```

[🔗 rxjs 공식 문서 - throttle](https://rxjs.dev/api/operators/throttle)
