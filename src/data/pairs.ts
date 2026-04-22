export interface PairInfo {
  symbol: string;
  tv: string;
  digits: number;
  pipSize: number;
  category: "forex_major" | "forex_minor" | "forex_exotic" | "crypto" | "metals" | "indices";
  label: string;
}

export const ALL_PAIRS: PairInfo[] = [
  // Форекс мажоры
  { symbol: "EUR/USD", tv: "FX:EURUSD", digits: 5, pipSize: 0.0001, category: "forex_major", label: "Евро / Доллар" },
  { symbol: "GBP/USD", tv: "FX:GBPUSD", digits: 5, pipSize: 0.0001, category: "forex_major", label: "Фунт / Доллар" },
  { symbol: "USD/JPY", tv: "FX:USDJPY", digits: 3, pipSize: 0.01, category: "forex_major", label: "Доллар / Иена" },
  { symbol: "AUD/USD", tv: "FX:AUDUSD", digits: 5, pipSize: 0.0001, category: "forex_major", label: "Австралийский / Доллар" },
  { symbol: "USD/CHF", tv: "FX:USDCHF", digits: 5, pipSize: 0.0001, category: "forex_major", label: "Доллар / Франк" },
  { symbol: "NZD/USD", tv: "FX:NZDUSD", digits: 5, pipSize: 0.0001, category: "forex_major", label: "Новозеландский / Доллар" },
  { symbol: "USD/CAD", tv: "FX:USDCAD", digits: 5, pipSize: 0.0001, category: "forex_major", label: "Доллар / Канадский" },
  // Форекс миноры
  { symbol: "EUR/GBP", tv: "FX:EURGBP", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Евро / Фунт" },
  { symbol: "EUR/JPY", tv: "FX:EURJPY", digits: 3, pipSize: 0.01, category: "forex_minor", label: "Евро / Иена" },
  { symbol: "GBP/JPY", tv: "FX:GBPJPY", digits: 3, pipSize: 0.01, category: "forex_minor", label: "Фунт / Иена" },
  { symbol: "EUR/CHF", tv: "FX:EURCHF", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Евро / Франк" },
  { symbol: "EUR/AUD", tv: "FX:EURAUD", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Евро / Австралийский" },
  { symbol: "EUR/CAD", tv: "FX:EURCAD", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Евро / Канадский" },
  { symbol: "GBP/CHF", tv: "FX:GBPCHF", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Фунт / Франк" },
  { symbol: "GBP/AUD", tv: "FX:GBPAUD", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Фунт / Австралийский" },
  { symbol: "GBP/CAD", tv: "FX:GBPCAD", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Фунт / Канадский" },
  { symbol: "AUD/JPY", tv: "FX:AUDJPY", digits: 3, pipSize: 0.01, category: "forex_minor", label: "Австралийский / Иена" },
  { symbol: "AUD/CAD", tv: "FX:AUDCAD", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Австралийский / Канадский" },
  { symbol: "AUD/NZD", tv: "FX:AUDNZD", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Австралийский / Новозеландский" },
  { symbol: "CAD/JPY", tv: "FX:CADJPY", digits: 3, pipSize: 0.01, category: "forex_minor", label: "Канадский / Иена" },
  { symbol: "CHF/JPY", tv: "FX:CHFJPY", digits: 3, pipSize: 0.01, category: "forex_minor", label: "Франк / Иена" },
  { symbol: "NZD/JPY", tv: "FX:NZDJPY", digits: 3, pipSize: 0.01, category: "forex_minor", label: "Новозеландский / Иена" },
  { symbol: "NZD/CAD", tv: "FX:NZDCAD", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Новозеландский / Канадский" },
  { symbol: "NZD/CHF", tv: "FX:NZDCHF", digits: 5, pipSize: 0.0001, category: "forex_minor", label: "Новозеландский / Франк" },
  // Экзотика
  { symbol: "USD/MXN", tv: "FX:USDMXN", digits: 5, pipSize: 0.0001, category: "forex_exotic", label: "Доллар / Мексиканский песо" },
  { symbol: "USD/ZAR", tv: "FX:USDZAR", digits: 5, pipSize: 0.0001, category: "forex_exotic", label: "Доллар / Ранд" },
  { symbol: "USD/TRY", tv: "FX:USDTRY", digits: 5, pipSize: 0.0001, category: "forex_exotic", label: "Доллар / Лира" },
  { symbol: "USD/SEK", tv: "FX:USDSEK", digits: 5, pipSize: 0.0001, category: "forex_exotic", label: "Доллар / Крона Швеции" },
  { symbol: "USD/NOK", tv: "FX:USDNOK", digits: 5, pipSize: 0.0001, category: "forex_exotic", label: "Доллар / Крона Норвегии" },
  { symbol: "USD/SGD", tv: "FX:USDSGD", digits: 5, pipSize: 0.0001, category: "forex_exotic", label: "Доллар / Сингапурский" },
  { symbol: "USD/HKD", tv: "FX:USDHKD", digits: 5, pipSize: 0.0001, category: "forex_exotic", label: "Доллар / Гонконгский" },
  // Металлы
  { symbol: "XAU/USD", tv: "TVC:GOLD", digits: 2, pipSize: 0.01, category: "metals", label: "Золото / Доллар" },
  { symbol: "XAG/USD", tv: "TVC:SILVER", digits: 4, pipSize: 0.001, category: "metals", label: "Серебро / Доллар" },
  // Крипто OTC / CFD
  { symbol: "BTC/USD", tv: "BINANCE:BTCUSDT", digits: 2, pipSize: 1, category: "crypto", label: "Биткоин / Доллар" },
  { symbol: "ETH/USD", tv: "BINANCE:ETHUSDT", digits: 2, pipSize: 0.1, category: "crypto", label: "Эфириум / Доллар" },
  { symbol: "BNB/USD", tv: "BINANCE:BNBUSDT", digits: 2, pipSize: 0.1, category: "crypto", label: "BNB / Доллар" },
  { symbol: "SOL/USD", tv: "BINANCE:SOLUSDT", digits: 2, pipSize: 0.01, category: "crypto", label: "Solana / Доллар" },
  { symbol: "XRP/USD", tv: "BINANCE:XRPUSDT", digits: 4, pipSize: 0.0001, category: "crypto", label: "Ripple / Доллар" },
  { symbol: "ADA/USD", tv: "BINANCE:ADAUSDT", digits: 4, pipSize: 0.0001, category: "crypto", label: "Cardano / Доллар" },
  { symbol: "DOGE/USD", tv: "BINANCE:DOGEUSDT", digits: 5, pipSize: 0.00001, category: "crypto", label: "Dogecoin / Доллар" },
  { symbol: "LTC/USD", tv: "BINANCE:LTCUSDT", digits: 2, pipSize: 0.01, category: "crypto", label: "Litecoin / Доллар" },
];

export const CATEGORIES = [
  { id: "forex_major", label: "Мажоры" },
  { id: "forex_minor", label: "Миноры" },
  { id: "forex_exotic", label: "Экзотика" },
  { id: "metals", label: "Металлы" },
  { id: "crypto", label: "Крипто" },
] as const;

export function getPairInfo(symbol: string): PairInfo {
  return ALL_PAIRS.find(p => p.symbol === symbol) ?? ALL_PAIRS[0];
}
