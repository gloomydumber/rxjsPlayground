const mother = [];

const father = new Set();

const btcPrice1 = {
  market: "BTCUSDT",
  price: 100,
};

const ethPrice1 = {
  market: "ETHUSDT",
  price: 50,
};

const btcPrice2 = {
  market: "BTCUSDT",
  price: 120,
};

mother.push(btcPrice1);
mother.push(ethPrice1);

console.log(mother);

mother.push(btcPrice2);

console.log(mother);

father.add({ ...btcPrice1 });
father.add({ ...btcPrice2 });

console.log(father);

for (value of father) {
  console.log(value);
}

const tway1 = {
  BTCUSDT: 100,
};

const tway2 = {
  BTCUSDT: 120,
};

// const uncle = new Set();

// uncle.add({ ...tway1 });
// uncle.add({ ...tway2 });

// console.log(uncle);

const tway3 = {
  ETHUSDT: 50,
};

const aunt = {};

Object.assign(aunt, tway1);
Object.assign(aunt, tway2);

console.log(aunt);

Object.assign(aunt, tway3);

console.log(aunt);

const TICKER = "BTC";
const TICKER2 = "1INCH";
const price = 120;
const jsonError = {
  [TICKER]: {
    ticker: TICKER,
    price,
  },
};

console.log(jsonError);

const jsonError2 = {
  [TICKER2]: {
    ticker: TICKER2,
    price,
  },
};

console.log(jsonError2);
console.log(jsonError.BTC);
console.log(jsonError2["1INCH"]);
console.log(jsonError["BTC"]);

console.log(JSON.stringify(jsonError));
console.log(JSON.stringify(jsonError2));

console.log(JSON.parse(JSON.stringify(jsonError)));
console.log(JSON.parse(JSON.stringify(jsonError2)));

const minas = "KRW-BTC";
console.log(minas);
console.log(minas.toString());

const minasObject = {
  [minas]: {
    market: "BTC",
    price: 10,
  },
};

console.log(minasObject);

const nonminas = "KRWBTC";

const nonminasObject = {
  [nonminas]: {
    market: "BTC",
    price: 10,
  },
};

console.log(nonminasObject);

const firstObject = {
  data: {
    name: "kim",
    age: 21,
  },
};

const secondObject = {
  data: {
    job: "student",
    telephone: 0x23,
  },
};

const spreadSyntax = { ...secondObject };
spreadSyntax.data.name = firstObject.data.name;
spreadSyntax.data.age = firstObject.data.age;
console.log(spreadSyntax);

const assignMethod = Object.assign(firstObject, secondObject);
console.log(assignMethod);
