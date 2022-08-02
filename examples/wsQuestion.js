const item = ["televison", "pc", "radio", "camera"];
const fooMarket = webSocket("wss://api.fooMarket.com/websocket/");
const barMarket = webSocket("wss://api.barMarket.com/websocket/");

// market WS unit Stream is like below (emit real-time price change for each Item)
// {
//   itemName : "televison",
//   price: 980
// }

const fromArray$ = of(...item).pipe(
  map((x) => {
    const fooItem = fooMarket.pipe(
      filter((y) => y.itemName === x),
      map((z) => ({ itemName, price: item.price }))
    );
    const barItem = barMarket.pipe(
      filter((y) => y.itemName === x),
      map((z) => ({ itemName, price: item.price }))
    );

    combineLatest({ [`foo-${x}`]: fooItem, [`var-${x}`]: barItem }).subscribe(
      console.log
    );
    // return combineLatest({ [`foo-${x}`]: fooItem, [`var-${x}`]: barItem }); // this way makes fromArray$'s type as Subscription (not Observable type)
  })
);

fromArray$.subscribe();

// result is like below
// {
//   "foo-televison": { itemName : "television", price: 980 },
//   "bar-televison : { itemName : "television", price: 950 }
// }
// {
//   "foo-pc": { itemName : "pc", price: 110 },
//   "bar-pc : { itemName : "pc", price: 120 }
// }
// ...continuing as Real-time Price Change
