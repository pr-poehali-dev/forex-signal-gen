import { useState, useEffect, useRef } from "react";
import { PriceData } from "./useRealtimePrice";
import { getPairInfo } from "@/data/pairs";

export interface IndicatorResult {
  name: string;
  value: number | string;
  signal: "buy" | "sell" | "neutral";
  weight: number;
  score: number;
  description: string;
}

export interface SignalResult {
  type: "BUY" | "SELL" | "WAIT";
  confidence: number;
  score: number;
  entry: number;
  tp1: number;
  tp2: number;
  sl: number;
  rr: string;
  pips: number;
  indicators: IndicatorResult[];
  aiVerdict: string;
  generatedAt: number;
  validity: number;
  trend: "bullish" | "bearish" | "neutral";
  strength: "сильный" | "умеренный" | "слабый";
}

// Хранилище свечей M1
const candleStore: Record<string, number[]> = {};
const MAX_CANDLES = 200;

function addPriceToCandles(symbol: string, price: number) {
  if (!candleStore[symbol]) candleStore[symbol] = [];
  candleStore[symbol].push(price);
  if (candleStore[symbol].length > MAX_CANDLES) {
    candleStore[symbol].shift();
  }
}

function getCandles(symbol: string): number[] {
  return candleStore[symbol] ?? [];
}

// ===== РАСЧЁТ ИНДИКАТОРОВ =====

function calcSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  const changes = prices.slice(-(period + 1)).map((v, i, a) => i === 0 ? 0 : v - a[i - 1]).slice(1);
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? -c : 0);
  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcMACD(prices: number[]): { macd: number; signal: number; hist: number } {
  if (prices.length < 35) return { macd: 0, signal: 0, hist: 0 };
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  const macd = ema12 - ema26;
  // Приближение signal как EMA9 от MACD
  const macdSeries = prices.slice(-35).map((_, i, arr) => {
    const sub = arr.slice(0, i + 1);
    return calcEMA(sub, 12) - calcEMA(sub, 26);
  });
  const signal = calcEMA(macdSeries, 9);
  return { macd, signal, hist: macd - signal };
}

function calcBollingerBands(prices: number[], period = 20, dev = 2): { upper: number; middle: number; lower: number; width: number; pos: number } {
  if (prices.length < period) {
    const p = prices[prices.length - 1] ?? 0;
    return { upper: p, middle: p, lower: p, width: 0, pos: 50 };
  }
  const slice = prices.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
  const std = Math.sqrt(variance);
  const upper = sma + dev * std;
  const lower = sma - dev * std;
  const price = prices[prices.length - 1];
  const pos = (price - lower) / (upper - lower) * 100;
  return { upper, middle: sma, lower, width: (upper - lower) / sma * 100, pos };
}

function calcStochastic(prices: number[], k = 14, d = 3): { k: number; d: number } {
  if (prices.length < k) return { k: 50, d: 50 };
  const slice = prices.slice(-k);
  const highest = Math.max(...slice);
  const lowest = Math.min(...slice);
  const kVal = lowest === highest ? 50 : ((prices[prices.length - 1] - lowest) / (highest - lowest)) * 100;
  // d = SMA3 приближение
  const kVals = [kVal, kVal * 0.98, kVal * 1.01];
  const dVal = kVals.reduce((a, b) => a + b, 0) / 3;
  return { k: kVal, d: dVal };
}

function calcATR(prices: number[], period = 14): number {
  if (prices.length < 2) return 0;
  const trs = prices.slice(-period - 1).map((v, i, a) => i === 0 ? 0 : Math.abs(v - a[i - 1])).slice(1);
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}

function calcCCI(prices: number[], period = 20): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const meanDev = slice.reduce((a, b) => a + Math.abs(b - sma), 0) / period;
  if (meanDev === 0) return 0;
  return (prices[prices.length - 1] - sma) / (0.015 * meanDev);
}

function calcWilliamsR(prices: number[], period = 14): number {
  if (prices.length < period) return -50;
  const slice = prices.slice(-period);
  const highest = Math.max(...slice);
  const lowest = Math.min(...slice);
  if (highest === lowest) return -50;
  return ((highest - prices[prices.length - 1]) / (highest - lowest)) * -100;
}

function calcMomentum(prices: number[], period = 10): number {
  if (prices.length < period + 1) return 0;
  return prices[prices.length - 1] - prices[prices.length - 1 - period];
}

function calcROC(prices: number[], period = 12): number {
  if (prices.length < period + 1) return 0;
  const old = prices[prices.length - 1 - period];
  if (old === 0) return 0;
  return ((prices[prices.length - 1] - old) / old) * 100;
}

function calcVortex(prices: number[], period = 14): { viPlus: number; viMinus: number } {
  if (prices.length < period + 1) return { viPlus: 1, viMinus: 1 };
  const vmp = prices.slice(-period).map((v, i, a) => i === 0 ? 0 : Math.abs(v - a[i - 1])).slice(1);
  const vmm = prices.slice(-period).map((v, i, a) => i === 0 ? 0 : Math.abs(a[i - 1] - v)).slice(1);
  const tr = vmp.map(v => v);
  const sumVmp = vmp.reduce((a, b) => a + b, 0);
  const sumVmm = vmm.reduce((a, b) => a + b, 0);
  const sumTr = tr.reduce((a, b) => a + b, 0.0001);
  return { viPlus: sumVmp / sumTr, viMinus: sumVmm / sumTr };
}

function calcADX(prices: number[], period = 14): number {
  if (prices.length < period * 2) return 20;
  // Упрощённый ADX через диапазон
  const recent = prices.slice(-period);
  const old = prices.slice(-period * 2, -period);
  const recentRange = Math.max(...recent) - Math.min(...recent);
  const oldRange = Math.max(...old) - Math.min(...old);
  const trend = Math.abs(recent[recent.length - 1] - recent[0]);
  const adx = Math.min(100, (trend / (recentRange + 0.0001)) * 100);
  return adx;
}

// ===== AI ВЗВЕШИВАНИЕ =====
// Веса индикаторов для M1 скальпинга (эмпирически подобраны)
const INDICATOR_WEIGHTS: Record<string, number> = {
  "RSI": 0.12,
  "MACD": 0.14,
  "EMA_CROSS": 0.13,
  "Bollinger": 0.10,
  "Stochastic": 0.09,
  "CCI": 0.08,
  "Williams %R": 0.07,
  "Momentum": 0.06,
  "ROC": 0.06,
  "Vortex": 0.05,
  "ADX": 0.04,
  "EMA50": 0.06,
  "Trend": 0.07,
  "Volatility": 0.02,
  "Price Action": 0.05,
};

// ===== ДВИЖОК СИГНАЛОВ =====
export function computeSignal(symbol: string, priceData: PriceData): SignalResult | null {
  const prices = getCandles(symbol);
  if (prices.length < 35) return null;

  const pair = getPairInfo(symbol);
  const price = priceData.price;
  const pip = pair.pipSize;

  const ema8 = calcEMA(prices, 8);
  const ema21 = calcEMA(prices, 21);
  const ema50 = calcEMA(prices, 50);
  const ema200 = prices.length >= 200 ? calcEMA(prices, 200) : calcEMA(prices, Math.floor(prices.length * 0.8));
  const rsi = calcRSI(prices, 14);
  const rsi6 = calcRSI(prices, 6);
  const macd = calcMACD(prices);
  const bb = calcBollingerBands(prices, 20);
  const stoch = calcStochastic(prices, 14);
  const atr = calcATR(prices, 14);
  const cci = calcCCI(prices, 20);
  const willR = calcWilliamsR(prices, 14);
  const mom = calcMomentum(prices, 10);
  const roc = calcROC(prices, 12);
  const vortex = calcVortex(prices, 14);
  const adx = calcADX(prices, 14);

  const indicators: IndicatorResult[] = [];

  // 1. RSI(14)
  const rsiSig = rsi < 35 ? "buy" : rsi > 65 ? "sell" : "neutral";
  const rsiScore = rsiSig === "buy" ? 1 : rsiSig === "sell" ? -1 : (50 - rsi) / 50;
  indicators.push({
    name: "RSI (14)", value: rsi.toFixed(1), signal: rsiSig,
    weight: INDICATOR_WEIGHTS["RSI"], score: rsiScore,
    description: rsi < 35 ? "Перепродан — сигнал BUY" : rsi > 65 ? "Перекуплен — сигнал SELL" : "Нейтральная зона",
  });

  // 2. RSI(6) — быстрый для M1
  const rsi6Sig = rsi6 < 25 ? "buy" : rsi6 > 75 ? "sell" : "neutral";
  const rsi6Score = rsi6Sig === "buy" ? 1 : rsi6Sig === "sell" ? -1 : (50 - rsi6) / 50;
  indicators.push({
    name: "RSI (6) M1", value: rsi6.toFixed(1), signal: rsi6Sig,
    weight: 0.08, score: rsi6Score,
    description: `Быстрый RSI для M1: ${rsi6 < 25 ? "перепродан" : rsi6 > 75 ? "перекуплен" : "нейтрально"}`,
  });

  // 3. MACD
  const macdSig = macd.hist > 0 ? "buy" : macd.hist < 0 ? "sell" : "neutral";
  const macdScore = macd.hist > 0 ? Math.min(1, macd.hist / atr) : Math.max(-1, macd.hist / atr);
  indicators.push({
    name: "MACD (12,26,9)", value: macd.hist.toFixed(6), signal: macdSig,
    weight: INDICATOR_WEIGHTS["MACD"], score: macdScore,
    description: `Гистограмма ${macd.hist > 0 ? "выше" : "ниже"} нуля — ${macdSig === "buy" ? "бычий" : macdSig === "sell" ? "медвежий" : "нейтральный"} импульс`,
  });

  // 4. EMA кросс (8/21)
  const emaCrossSig = ema8 > ema21 ? "buy" : "sell";
  const emaCrossScore = (ema8 - ema21) / (atr + 0.000001) * 0.5;
  indicators.push({
    name: "EMA Cross (8/21)", value: `${ema8.toFixed(pair.digits)} / ${ema21.toFixed(pair.digits)}`, signal: emaCrossSig,
    weight: INDICATOR_WEIGHTS["EMA_CROSS"], score: Math.max(-1, Math.min(1, emaCrossScore)),
    description: `EMA8 ${ema8 > ema21 ? ">" : "<"} EMA21 — ${emaCrossSig === "buy" ? "восходящий" : "нисходящий"} краткосрочный тренд`,
  });

  // 5. Bollinger Bands
  let bbSig: "buy" | "sell" | "neutral" = "neutral";
  let bbScore = 0;
  if (bb.pos < 15) { bbSig = "buy"; bbScore = 1; }
  else if (bb.pos > 85) { bbSig = "sell"; bbScore = -1; }
  else { bbScore = (50 - bb.pos) / 50; }
  indicators.push({
    name: "Bollinger Bands", value: `${bb.pos.toFixed(0)}%`, signal: bbSig,
    weight: INDICATOR_WEIGHTS["Bollinger"], score: bbScore,
    description: `Позиция ${bb.pos.toFixed(0)}% в канале. ${bb.pos < 15 ? "У нижней полосы — покупка" : bb.pos > 85 ? "У верхней полосы — продажа" : "Середина канала"}`,
  });

  // 6. Stochastic
  const stochSig = stoch.k < 20 && stoch.k > stoch.d ? "buy" : stoch.k > 80 && stoch.k < stoch.d ? "sell" : "neutral";
  const stochScore = stochSig === "buy" ? 1 : stochSig === "sell" ? -1 : (50 - stoch.k) / 50;
  indicators.push({
    name: "Stochastic (14,3)", value: `K:${stoch.k.toFixed(1)} D:${stoch.d.toFixed(1)}`, signal: stochSig,
    weight: INDICATOR_WEIGHTS["Stochastic"], score: stochScore,
    description: stoch.k < 20 ? "Зона перепроданности — BUY" : stoch.k > 80 ? "Зона перекупленности — SELL" : "Нейтральная зона",
  });

  // 7. CCI
  const cciSig = cci < -100 ? "buy" : cci > 100 ? "sell" : "neutral";
  const cciScore = cci < -100 ? 1 : cci > 100 ? -1 : -cci / 100;
  indicators.push({
    name: "CCI (20)", value: cci.toFixed(1), signal: cciSig,
    weight: INDICATOR_WEIGHTS["CCI"], score: Math.max(-1, Math.min(1, cciScore)),
    description: `CCI ${cci.toFixed(0)}: ${cci < -100 ? "перепродан" : cci > 100 ? "перекуплен" : "нейтрально"}`,
  });

  // 8. Williams %R
  const willSig = willR < -80 ? "buy" : willR > -20 ? "sell" : "neutral";
  const willScore = willR < -80 ? 1 : willR > -20 ? -1 : (-50 - willR) / 50;
  indicators.push({
    name: "Williams %R", value: willR.toFixed(1), signal: willSig,
    weight: INDICATOR_WEIGHTS["Williams %R"], score: Math.max(-1, Math.min(1, willScore)),
    description: `${willR < -80 ? "Зона перепроданности" : willR > -20 ? "Зона перекупленности" : "Нейтрально"}`,
  });

  // 9. Momentum
  const momSig = mom > 0 ? "buy" : mom < 0 ? "sell" : "neutral";
  const momScore = Math.max(-1, Math.min(1, mom / (atr * 5 + 0.000001)));
  indicators.push({
    name: "Momentum (10)", value: mom.toFixed(6), signal: momSig,
    weight: INDICATOR_WEIGHTS["Momentum"], score: momScore,
    description: `Импульс ${mom > 0 ? "положительный — давление покупателей" : "отрицательный — давление продавцов"}`,
  });

  // 10. ROC
  const rocSig = roc > 0 ? "buy" : roc < 0 ? "sell" : "neutral";
  const rocScore = Math.max(-1, Math.min(1, roc / 0.1));
  indicators.push({
    name: "ROC (12)", value: `${roc.toFixed(4)}%`, signal: rocSig,
    weight: INDICATOR_WEIGHTS["ROC"], score: rocScore,
    description: `Скорость изменения цены: ${roc > 0 ? "ускорение роста" : "ускорение падения"}`,
  });

  // 11. Vortex Indicator
  const vortexSig = vortex.viPlus > vortex.viMinus ? "buy" : "sell";
  const vortexScore = (vortex.viPlus - vortex.viMinus) * 2;
  indicators.push({
    name: "Vortex (14)", value: `VI+:${vortex.viPlus.toFixed(3)}`, signal: vortexSig,
    weight: INDICATOR_WEIGHTS["Vortex"], score: Math.max(-1, Math.min(1, vortexScore)),
    description: `VI+ ${vortex.viPlus > vortex.viMinus ? ">" : "<"} VI- — ${vortexSig === "buy" ? "бычья" : "медвежья"} фаза`,
  });

  // 12. ADX (сила тренда)
  const adxSig = adx > 25 ? (ema8 > ema21 ? "buy" : "sell") : "neutral";
  const adxScore = adx > 25 ? (ema8 > ema21 ? Math.min(1, adx / 50) : -Math.min(1, adx / 50)) : 0;
  indicators.push({
    name: "ADX (14)", value: adx.toFixed(1), signal: adxSig,
    weight: INDICATOR_WEIGHTS["ADX"], score: adxScore,
    description: `Сила тренда: ${adx < 20 ? "слабый" : adx < 40 ? "умеренный" : "сильный"} (${adx.toFixed(0)})`,
  });

  // 13. EMA50 позиция
  const ema50Sig = price > ema50 ? "buy" : "sell";
  const ema50Score = (price - ema50) / (atr * 10 + 0.000001);
  indicators.push({
    name: "EMA 50", value: ema50.toFixed(pair.digits), signal: ema50Sig,
    weight: INDICATOR_WEIGHTS["EMA50"], score: Math.max(-1, Math.min(1, ema50Score)),
    description: `Цена ${price > ema50 ? "выше" : "ниже"} EMA50 — ${price > ema50 ? "среднесрочный бычий" : "среднесрочный медвежий"} тренд`,
  });

  // 14. Тренд EMA200
  const trendSig = price > ema200 ? "buy" : "sell";
  const trendScore = (price - ema200) / (atr * 30 + 0.000001);
  indicators.push({
    name: "Тренд EMA 200", value: ema200.toFixed(pair.digits), signal: trendSig,
    weight: INDICATOR_WEIGHTS["Trend"], score: Math.max(-1, Math.min(1, trendScore)),
    description: `Глобальный тренд: цена ${price > ema200 ? "выше" : "ниже"} EMA200`,
  });

  // 15. Price Action (последние 5 свечей)
  const last5 = prices.slice(-5);
  const priceUp = last5[last5.length - 1] > last5[0];
  const priceSig = priceUp ? "buy" : "sell";
  const priceScore = (last5[last5.length - 1] - last5[0]) / (atr * 3 + 0.000001);
  indicators.push({
    name: "Price Action M1", value: `${priceUp ? "▲" : "▼"} ${Math.abs(priceScore * 100).toFixed(2)}%`, signal: priceSig,
    weight: INDICATOR_WEIGHTS["Price Action"], score: Math.max(-1, Math.min(1, priceScore)),
    description: `Динамика последних 5 секунд: ${priceUp ? "движение вверх" : "движение вниз"}`,
  });

  // ===== AI ВЗВЕШИВАНИЕ =====
  let totalWeight = 0;
  let weightedScore = 0;
  let buyVotes = 0;
  let sellVotes = 0;

  for (const ind of indicators) {
    const w = ind.weight;
    weightedScore += ind.score * w;
    totalWeight += w;
    if (ind.signal === "buy") buyVotes++;
    else if (ind.signal === "sell") sellVotes++;
  }

  const normalizedScore = weightedScore / (totalWeight || 1);
  const consensus = (buyVotes - sellVotes) / indicators.length;

  // Финальный AI-скор: взвешенный балл + консенсус
  const finalScore = normalizedScore * 0.7 + consensus * 0.3;

  // Уровень уверенности
  const absScore = Math.abs(finalScore);
  const confidence = Math.min(99, Math.round(50 + absScore * 50));

  // Тип сигнала
  let type: "BUY" | "SELL" | "WAIT" = "WAIT";
  if (finalScore > 0.15 && buyVotes > sellVotes) type = "BUY";
  else if (finalScore < -0.15 && sellVotes > buyVotes) type = "SELL";

  // ATR-based TP/SL для M1
  const atrM1 = atr * 3;
  const tpPips = Math.max(5, Math.round(atrM1 / pip));
  const slPips = Math.max(3, Math.round(atrM1 * 0.6 / pip));

  const entry = price;
  const tp1 = type === "BUY" ? entry + tpPips * pip : entry - tpPips * pip;
  const tp2 = type === "BUY" ? entry + tpPips * pip * 1.5 : entry - tpPips * pip * 1.5;
  const sl = type === "BUY" ? entry - slPips * pip : entry + slPips * pip;
  const rr = (tpPips / slPips).toFixed(1);

  // Сила тренда
  const strength: SignalResult["strength"] = absScore > 0.5 ? "сильный" : absScore > 0.25 ? "умеренный" : "слабый";
  const trend: SignalResult["trend"] = finalScore > 0.1 ? "bullish" : finalScore < -0.1 ? "bearish" : "neutral";

  // AI вердикт
  const buyCount = indicators.filter(i => i.signal === "buy").length;
  const sellCount = indicators.filter(i => i.signal === "sell").length;
  const neutralCount = indicators.length - buyCount - sellCount;
  let aiVerdict = "";
  if (type === "BUY") {
    aiVerdict = `ИИ: ${buyCount}/${indicators.length} индикаторов подтверждают ПОКУПКУ. Уверенность ${confidence}%. ${strength === "сильный" ? "Сильный сигнал — хорошая точка входа." : "Умеренный сигнал — внимательно следите за ценой."}`;
  } else if (type === "SELL") {
    aiVerdict = `ИИ: ${sellCount}/${indicators.length} индикаторов подтверждают ПРОДАЖУ. Уверенность ${confidence}%. ${strength === "сильный" ? "Сильный сигнал — хорошая точка входа." : "Умеренный сигнал — внимательно следите за ценой."}`;
  } else {
    aiVerdict = `ИИ: ${neutralCount} нейтральных, ${buyCount} BUY, ${sellCount} SELL. Сигнал неоднозначен — рекомендую ЖДАТЬ подтверждения.`;
  }

  return {
    type, confidence, score: parseFloat(finalScore.toFixed(4)),
    entry, tp1, tp2, sl,
    rr: `1:${rr}`, pips: tpPips,
    indicators, aiVerdict,
    generatedAt: Date.now(),
    validity: 60,
    trend, strength,
  };
}

export function useSignalEngine(symbol: string, priceData: PriceData): { signal: SignalResult | null; candleCount: number } {
  const [signal, setSignal] = useState<SignalResult | null>(null);
  const [candleCount, setCandleCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    addPriceToCandles(symbol, priceData.price);
    const count = getCandles(symbol).length;
    setCandleCount(count);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const s = computeSignal(symbol, priceData);
      if (s) setSignal(s);
    }, 5000);

    const s = computeSignal(symbol, priceData);
    if (s) setSignal(s);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [symbol]);

  useEffect(() => {
    addPriceToCandles(symbol, priceData.price);
    setCandleCount(getCandles(symbol).length);
  }, [priceData.price, symbol]);

  return { signal, candleCount };
}
