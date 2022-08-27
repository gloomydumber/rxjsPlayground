export class AutoLendService {
  constructor(
    tickerPort,
  )

  autoLend() {
    // 1. Get Ticker List -> 정적, 동적
    const tickers = tickerPort.getTickers();
    // 2. Get Price from binance, upbit
    // 3. Get USD
    // 4. combine same ticker
    // 5. GET USDT from BTC
    // 6. combine USDT, USD, binance, upbit
    // 7. merge all
    // 8. catch premium
    // 9. lend from biance
    // 10. send telegram message
  }
}