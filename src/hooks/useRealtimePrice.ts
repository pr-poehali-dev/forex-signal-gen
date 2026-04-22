import { useState, useEffect, useRef, useCallback } from "react";

export interface PriceData {
  price: number;
  prevPrice: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
  direction: "up" | "down" | "flat";
}

// Базовые цены для симуляции реального рынка
const BASE_PRICES: Record<string, number> = {
  "EUR/USD": 1.08432, "GBP/USD": 1.26741, "USD/JPY": 154.32,
  "AUD/USD": 0.65233, "USD/CHF": 0.89812, "NZD/USD": 0.60112,
  "USD/CAD": 1.35621, "EUR/GBP": 0.85531, "EUR/JPY": 167.21,
  "GBP/JPY": 195.44, "EUR/CHF": 0.97112, "EUR/AUD": 1.66231,
  "EUR/CAD": 1.47621, "GBP/CHF": 1.12881, "GBP/AUD": 1.94211,
  "GBP/CAD": 1.71241, "AUD/JPY": 100.621, "AUD/CAD": 0.88421,
  "AUD/NZD": 1.09001, "CAD/JPY": 113.821, "CHF/JPY": 171.991,
  "NZD/JPY": 92.121, "NZD/CAD": 0.81221, "NZD/CHF": 0.53811,
  "USD/MXN": 17.1812, "USD/ZAR": 18.6421, "USD/TRY": 32.1241,
  "USD/SEK": 10.3411, "USD/NOK": 10.5621, "USD/SGD": 1.34421,
  "USD/HKD": 7.82111, "XAU/USD": 2341.20, "XAG/USD": 27.821,
  "BTC/USD": 67412.5, "ETH/USD": 3512.8, "BNB/USD": 572.4,
  "SOL/USD": 142.31, "XRP/USD": 0.5212, "ADA/USD": 0.4521,
  "DOGE/USD": 0.15231, "LTC/USD": 84.21,
};

// Волатильность (% в секунду)
const VOLATILITY: Record<string, number> = {
  "EUR/USD": 0.00003, "GBP/USD": 0.00004, "USD/JPY": 0.00003,
  "AUD/USD": 0.00004, "USD/CHF": 0.00003, "NZD/USD": 0.00005,
  "USD/CAD": 0.00003, "EUR/GBP": 0.00002, "EUR/JPY": 0.00004,
  "GBP/JPY": 0.00006, "EUR/CHF": 0.00002, "EUR/AUD": 0.00005,
  "EUR/CAD": 0.00004, "GBP/CHF": 0.00004, "GBP/AUD": 0.00006,
  "GBP/CAD": 0.00005, "AUD/JPY": 0.00005, "AUD/CAD": 0.00004,
  "AUD/NZD": 0.00003, "CAD/JPY": 0.00004, "CHF/JPY": 0.00004,
  "NZD/JPY": 0.00005, "NZD/CAD": 0.00004, "NZD/CHF": 0.00003,
  "USD/MXN": 0.00008, "USD/ZAR": 0.0001, "USD/TRY": 0.00015,
  "USD/SEK": 0.00007, "USD/NOK": 0.00007, "USD/SGD": 0.00003,
  "USD/HKD": 0.00001, "XAU/USD": 0.00015, "XAG/USD": 0.0002,
  "BTC/USD": 0.0004, "ETH/USD": 0.0005, "BNB/USD": 0.0004,
  "SOL/USD": 0.0006, "XRP/USD": 0.0005, "ADA/USD": 0.0005,
  "DOGE/USD": 0.0006, "LTC/USD": 0.0004,
};

// Спреды (в единицах цены)
const SPREADS: Record<string, number> = {
  "EUR/USD": 0.00012, "GBP/USD": 0.00014, "USD/JPY": 0.012,
  "AUD/USD": 0.00015, "USD/CHF": 0.00014, "NZD/USD": 0.00018,
  "USD/CAD": 0.00015, "EUR/GBP": 0.00012, "EUR/JPY": 0.015,
  "GBP/JPY": 0.022, "EUR/CHF": 0.00018, "EUR/AUD": 0.00022,
  "EUR/CAD": 0.0002, "GBP/CHF": 0.0002, "GBP/AUD": 0.00028,
  "GBP/CAD": 0.00025, "AUD/JPY": 0.018, "AUD/CAD": 0.0002,
  "AUD/NZD": 0.00022, "CAD/JPY": 0.018, "CHF/JPY": 0.02,
  "NZD/JPY": 0.02, "NZD/CAD": 0.0002, "NZD/CHF": 0.0002,
  "USD/MXN": 0.002, "USD/ZAR": 0.004, "USD/TRY": 0.01,
  "USD/SEK": 0.002, "USD/NOK": 0.002, "USD/SGD": 0.0003,
  "USD/HKD": 0.0003, "XAU/USD": 0.15, "XAG/USD": 0.03,
  "BTC/USD": 15, "ETH/USD": 1.5, "BNB/USD": 0.5,
  "SOL/USD": 0.05, "XRP/USD": 0.001, "ADA/USD": 0.001,
  "DOGE/USD": 0.0002, "LTC/USD": 0.1,
};

// Глобальный кэш цен — чтобы разные компоненты видели одну цену
const priceCache: Record<string, PriceData> = {};
const listeners: Record<string, Set<(data: PriceData) => void>> = {};

// Генератор цен на основе движения Броуна + микротренды
function generateNextPrice(symbol: string, prev: PriceData): PriceData {
  const vol = (VOLATILITY[symbol] ?? 0.00004) * prev.price;
  const spread = SPREADS[symbol] ?? 0.00014;

  // Микротренд — небольшое смещение
  const microTrend = (Math.random() - 0.495) * vol * 2;
  const noise = (Math.random() - 0.5) * vol;
  const delta = microTrend + noise;

  const newPrice = parseFloat((prev.price + delta).toFixed(8));
  const bid = parseFloat((newPrice - spread / 2).toFixed(8));
  const ask = parseFloat((newPrice + spread / 2).toFixed(8));
  const newHigh = Math.max(prev.high, newPrice);
  const newLow = Math.min(prev.low, newPrice);
  const change = newPrice - prev.open;
  const changePct = (change / prev.open) * 100;

  return {
    price: newPrice,
    prevPrice: prev.price,
    change: parseFloat(change.toFixed(8)),
    changePct: parseFloat(changePct.toFixed(4)),
    high: newHigh,
    low: newLow,
    open: prev.open,
    bid,
    ask,
    spread,
    timestamp: Date.now(),
    direction: delta > 0.0000001 ? "up" : delta < -0.0000001 ? "down" : "flat",
  };
}

// Инициализация кэша
function initPrice(symbol: string): PriceData {
  const base = BASE_PRICES[symbol] ?? 1.0;
  const spread = SPREADS[symbol] ?? 0.00014;
  return {
    price: base, prevPrice: base,
    change: 0, changePct: 0,
    high: base * 1.001, low: base * 0.999,
    open: base,
    bid: base - spread / 2, ask: base + spread / 2,
    spread,
    timestamp: Date.now(),
    direction: "flat",
  };
}

let tickTimer: ReturnType<typeof setInterval> | null = null;
const activeSymbols = new Set<string>();

function startGlobalTick() {
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    for (const symbol of activeSymbols) {
      if (!priceCache[symbol]) priceCache[symbol] = initPrice(symbol);
      priceCache[symbol] = generateNextPrice(symbol, priceCache[symbol]);
      listeners[symbol]?.forEach(fn => fn(priceCache[symbol]));
    }
  }, 1000);
}

export function useRealtimePrice(symbol: string): PriceData {
  const [data, setData] = useState<PriceData>(() => {
    if (!priceCache[symbol]) priceCache[symbol] = initPrice(symbol);
    return priceCache[symbol];
  });

  const setDataRef = useRef(setData);
  setDataRef.current = setData;

  const handler = useCallback((d: PriceData) => setDataRef.current(d), []);

  useEffect(() => {
    if (!listeners[symbol]) listeners[symbol] = new Set();
    listeners[symbol].add(handler);
    activeSymbols.add(symbol);
    startGlobalTick();

    if (!priceCache[symbol]) priceCache[symbol] = initPrice(symbol);
    setData(priceCache[symbol]);

    return () => {
      listeners[symbol]?.delete(handler);
      if (!listeners[symbol]?.size) activeSymbols.delete(symbol);
    };
  }, [symbol, handler]);

  return data;
}

export function useMultiPrice(symbols: string[]): Record<string, PriceData> {
  const [prices, setPrices] = useState<Record<string, PriceData>>(() => {
    const init: Record<string, PriceData> = {};
    for (const s of symbols) {
      if (!priceCache[s]) priceCache[s] = initPrice(s);
      init[s] = priceCache[s];
    }
    return init;
  });

  useEffect(() => {
    const handlers: Record<string, (d: PriceData) => void> = {};
    for (const s of symbols) {
      if (!listeners[s]) listeners[s] = new Set();
      if (!priceCache[s]) priceCache[s] = initPrice(s);
      activeSymbols.add(s);
      handlers[s] = (d: PriceData) => setPrices(prev => ({ ...prev, [s]: d }));
      listeners[s].add(handlers[s]);
    }
    startGlobalTick();
    return () => {
      for (const s of symbols) {
        listeners[s]?.delete(handlers[s]);
        if (!listeners[s]?.size) activeSymbols.delete(s);
      }
    };
  }, [symbols.join(",")]);

  return prices;
}
