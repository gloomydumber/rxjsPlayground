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
