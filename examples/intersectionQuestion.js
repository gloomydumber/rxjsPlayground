const {
  map,
  mergeMap,
  switchMap,
  pluck,
  retry,
  tap,
  combineLatestWith,
  retryWhen,
  distinct,
  reduce,
  scan,
  skip,
} = require("rxjs/operators");
const { of, from, Observable, merge, combineLatest } = require("rxjs");

// merge(
//   from([
//     ["foo", "bar", "baz", "qux"],
//     ["bar", "garply", "fred", "foo"],
//   ])
// )
//   .pipe(
//     map((x) => x),
//     intersection()
//   )
// .subscribe((x) => console.log(x));

/*...*/

function intersection() {
  return (observable) => {
    return new Observable((subscriber) => {
      let acc; // keeps track of the state.
      const subscription = observable.subscribe({
        next: (cur) => {
          acc = !acc ? cur : acc.filter((x) => cur.includes(x));
          subscriber.next(acc);
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => subscription.unsubscribe();
    });
  };
}

console.time("rxjs");
merge(
  from([
    ["foo", "bar", "baz", "qux"],
    ["bar", "garply", "fred", "foo"],
  ])
)
  .pipe(
    map((x) => x),
    reduce((acc, cur) => {
      return !acc ? next : acc.filter((x) => cur.includes(x));
    })
  )
  .subscribe(console.log);
console.timeEnd("rxjs");

// of(["foo", "bar", "baz"], ["bar", "baz", "qoo"])
//   .pipe(scan((acc, cur) => acc + cur))
//   .subscribe(console.log);

// const filteredArray = array1.filter(value => array2.includes(value));
console.time("js");
const filteredArray = combineLatest({
  upbitTicker: [["foo", "bar", "baz", "qux"]],
  binanceTicker: [["bar", "garply", "fred", "foo"]],
}).pipe(
  map((x) => x.upbitTicker.filter((value) => x.binanceTicker.includes(value)))
);

filteredArray.subscribe(console.log);
console.timeEnd("js");
