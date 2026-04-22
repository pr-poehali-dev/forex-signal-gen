export const generateCandles = (base: number, count: number, volatility = 0.008) => {
  const candles = [];
  let price = base;
  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * volatility * price;
    const close = open + change;
    const highExtra = Math.random() * volatility * price * 0.5;
    const lowExtra = Math.random() * volatility * price * 0.5;
    candles.push({
      open,
      close,
      high: Math.max(open, close) + highExtra,
      low: Math.min(open, close) - lowExtra,
    });
    price = close;
  }
  return candles;
};

export const generateLine = (base: number, count: number, trend = 0) => {
  const data = [];
  let v = base;
  for (let i = 0; i < count; i++) {
    v = v + (Math.random() - 0.5 + trend * 0.1) * base * 0.01;
    data.push(parseFloat(v.toFixed(4)));
  }
  return data;
};

export const PAIRS = [
  { symbol: "EUR/USD", price: 1.08432, change: 0.12, vol: 0.006 },
  { symbol: "GBP/USD", price: 1.26741, change: 0.08, vol: 0.007 },
  { symbol: "USD/JPY", price: 154.32, change: -0.21, vol: 0.005 },
  { symbol: "AUD/USD", price: 0.65233, change: 0.31, vol: 0.008 },
  { symbol: "USD/CHF", price: 0.89812, change: 0.07, vol: 0.005 },
  { symbol: "NZD/USD", price: 0.60112, change: -0.14, vol: 0.009 },
  { symbol: "USD/CAD", price: 1.35621, change: -0.09, vol: 0.006 },
  { symbol: "EUR/GBP", price: 0.85531, change: 0.03, vol: 0.004 },
];

export const SIGNALS = [
  { id: 1, pair: "EUR/USD", type: "BUY", tf: "H1", price: "1.08341", tp: "1.08820", sl: "1.08100", time: "14:32", accuracy: 78, profit: "+47 pip" },
  { id: 2, pair: "GBP/USD", type: "SELL", tf: "H4", price: "1.27012", tp: "1.26520", sl: "1.27300", time: "13:15", accuracy: 82, profit: "+49 pip" },
  { id: 3, pair: "USD/JPY", type: "BUY", tf: "M15", price: "154.120", tp: "154.680", sl: "153.800", time: "12:47", accuracy: 71, profit: "+56 pip" },
  { id: 4, pair: "AUD/USD", type: "SELL", tf: "H1", price: "0.65410", tp: "0.64980", sl: "0.65620", time: "11:20", accuracy: 75, profit: "+43 pip" },
  { id: 5, pair: "EUR/GBP", type: "BUY", tf: "D1", price: "0.85210", tp: "0.85900", sl: "0.84900", time: "09:00", accuracy: 85, profit: "+69 pip" },
  { id: 6, pair: "USD/CHF", type: "SELL", tf: "H4", price: "0.90120", tp: "0.89500", sl: "0.90450", time: "08:30", accuracy: 79, profit: "+62 pip" },
  { id: 7, pair: "NZD/USD", type: "BUY", tf: "H1", price: "0.59980", tp: "0.60450", sl: "0.59700", time: "07:15", accuracy: 68, profit: "+47 pip" },
  { id: 8, pair: "USD/CAD", type: "SELL", tf: "M30", price: "1.35890", tp: "1.35200", sl: "1.36200", time: "06:45", accuracy: 73, profit: "+69 pip" },
];

export const INDICATORS = {
  rsi: { name: "RSI", value: 58.4, period: 14, overbought: 70, oversold: 30 },
  macd: { name: "MACD", fast: 12, slow: 26, signal: 9, value: 0.00032, trend: "bullish" },
  bb: { name: "Bollinger Bands", period: 20, deviation: 2, upper: 1.09120, middle: 1.08432, lower: 1.07744 },
  ema: { name: "EMA", periods: [20, 50, 200], values: [1.08401, 1.08220, 1.07890] },
  atr: { name: "ATR", period: 14, value: 0.00821 },
  stoch: { name: "Stochastic", k: 65.2, d: 58.7, period: 14 },
};

export const PATTERNS = [
  { name: "Бычье поглощение", reliability: 82, timeframe: "H1", direction: "up" },
  { name: "Молот", reliability: 74, timeframe: "H4", direction: "up" },
  { name: "Три белых солдата", reliability: 79, timeframe: "D1", direction: "up" },
  { name: "Вечерняя звезда", reliability: 77, timeframe: "H4", direction: "down" },
];
