const { of, fromEvent, repeatWhen } = require("rxjs");

const source = of("Repeat message");
const documentClick$ = fromEvent(document, "click");

const result = source.pipe(repeatWhen(() => documentClick$));

result.subscribe((data) => console.log(data));
