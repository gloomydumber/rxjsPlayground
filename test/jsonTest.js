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
