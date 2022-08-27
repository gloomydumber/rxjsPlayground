const TickerPersistenceAdapter = new TickerPersistenceAdapter();
const autoLendService = new AutoLendService(TickerPersistenceAdapter);

autoLendService.autoLend();
