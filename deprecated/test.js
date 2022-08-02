global.WebSocket = require("ws");
const { KRW } = require("../test/krw");
const { USDT } = require("../test/usdt");
const { webSocket } = require("rxjs/webSocket");
const { map, scan, concatMap } = require("rxjs/operators");
const { v4 } = require("uuid");
const { merge, zip } = require("rxjs");

const binanceQuery = USDT.join("@trade/") + "@trade";
const subjectBinance = webSocket(
  `wss://stream.binance.com:9443/ws/${binanceQuery}`
);

const upbitInit = JSON.parse(
  `[{ "ticket": "${v4()}" }, { "type": "ticker", "codes": ${JSON.stringify(
    KRW
  )} }]`
);
const subjectUpbit = webSocket("wss://api.upbit.com/websocket/v1");
subjectUpbit.next(upbitInit);

// const bpipe = subjectBinance.pipe(
//   map((x) => ({
//     [x.s]: { market: x.s, price: Number(x.p) },
//   }))
// );

// const upipe = subjectUpbit.pipe(
//   map((x) => ({
//     [x.code]: { market: x.code, price: x.trade_price },
//   }))
// );

const bpipe = subjectBinance.pipe(
  map((x) => {
    const ticker = x.s.slice(0, -4);
    return { [ticker]: { USDTmarket: x.s, USDTprice: Number(x.p) } };
  })
);
// [0-9A-Za-z]+(USDT|BUSD)

const upipe = subjectUpbit.pipe(
  map((x) => {
    const ticker = x.code.split("-")[1];
    return {
      [ticker]: { KRWmarket: x.code, KRWprice: x.trade_price },
    };
  })
);

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

// bpipe
//   .pipe(
//     scan((acc, value) => {
//       acc.push(value);
//       // Object.assign(acc, value);
//       return acc;
//     }, [])
//   )
//   .subscribe((x) => console.log(x));

// setInterval(() => {
//   console.log("상태갱신", blank);
// }, 1000);

// subject.next({
//   message: `ping`,
// });

// ====>map===>|--------------------------------|
//             | BTC{upbit: 1000, binance: 900} | ===> 대출해줘 =>
// ====>map===>|--------------------------------|

// BTC, XRP ...                                                                                                           괴리 포착기 (subscriber), merge된 subject 1개만 받아서
//===binance==>  A ===> filter(BTC) ====> { Bprice : 23 } ==> |----------------------------------------------|
//                                                            | combinelatest{Bprice: W, Uprice: W, Gap: 4}  |  ====|
//===Upbit====> 1 ====> filter(BTC) ====> { Uprice : 12 } ==> |----------------------------------------------|      |             |-------------------|
//                                                                                                                  |====merge===>|  대출 해줘        |===>
//===binance==>  B ===> filter(XRP) ====> { Bprice : 44 } ==> |----------------------------------------------|      |             |-------------------|
//                                                            | combinelatest{Bprice: W, Uprice: W, Gap: 4}  |  ====|
//===Upbit====> 2 ====> filter(XRP) ====> { Uprice : 11 } ==> |----------------------------------------------|
// stateless
