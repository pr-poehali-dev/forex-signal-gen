import { useState, useMemo } from "react";
import CandleChart from "./CandleChart";
import Icon from "@/components/ui/icon";
import { PAIRS, INDICATORS, PATTERNS, generateCandles } from "@/data/mockData";

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

export default function Analysis({ selectedPair }: { selectedPair: string }) {
  const [pair, setPair] = useState(selectedPair || "EUR/USD");
  const [tf, setTf] = useState("H1");

  const candles = useMemo(() => {
    const base = PAIRS.find(p => p.symbol === pair)?.price ?? 1.08;
    return generateCandles(base, 40, PAIRS.find(p => p.symbol === pair)?.vol ?? 0.006);
  }, [pair, tf]);

  const lastCandle = candles[candles.length - 1];
  const isUp = lastCandle.close >= lastCandle.open;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Анализ пары</h1>
          <p className="text-sm text-white/40 mt-0.5">Индикаторы, паттерны и сигналы</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={pair}
            onChange={e => setPair(e.target.value)}
            className="bg-transparent border rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none cursor-pointer"
            style={{ borderColor: "var(--border-glow)", background: "var(--bg-card)" }}
          >
            {PAIRS.map(p => (
              <option key={p.symbol} value={p.symbol} style={{ background: "#0a1628" }}>{p.symbol}</option>
            ))}
          </select>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-glow)" }}>
            {TIMEFRAMES.map(t => (
              <button
                key={t}
                onClick={() => setTf(t)}
                className={`px-3 py-1.5 text-xs font-bold font-mono transition-all ${tf === t ? "text-black font-bold" : "text-white/40 hover:text-white/70"}`}
                style={tf === t ? { background: "var(--neon-green)" } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-glow rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold font-mono text-white">{pair}</span>
            <span className="ml-3 text-2xl font-bold font-mono" style={{ color: isUp ? "var(--neon-green)" : "var(--neon-red)" }}>
              {lastCandle.close.toFixed(lastCandle.close > 100 ? 2 : 5)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name={isUp ? "TrendingUp" : "TrendingDown"} size={16} style={{ color: isUp ? "var(--neon-green)" : "var(--neon-red)" }} />
            <span className={`text-sm font-mono font-bold ${isUp ? "neon-text" : "neon-red"}`}>
              {isUp ? "+" : ""}{(((lastCandle.close - candles[0].open) / candles[0].open) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
          <CandleChart candles={candles} width={560} height={200} />
        </div>
        <div className="flex gap-6 mt-3 text-xs font-mono text-white/30">
          {[
            { l: "O", v: lastCandle.open.toFixed(5) },
            { l: "H", v: lastCandle.high.toFixed(5) },
            { l: "L", v: lastCandle.low.toFixed(5) },
            { l: "C", v: lastCandle.close.toFixed(5) },
          ].map(x => (
            <span key={x.l}><span className="text-white/20">{x.l}: </span><span className="text-white/60">{x.v}</span></span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-glow rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Icon name="BarChart2" size={14} style={{ color: "var(--neon-blue)" }} />
            Индикаторы
          </h3>
          <div className="space-y-3">
            <IndicatorRow label="RSI (14)" value={`${INDICATORS.rsi.value}`} signal="нейтрально" color="var(--neon-yellow)" bar={INDICATORS.rsi.value / 100} />
            <IndicatorRow label="MACD" value={`${INDICATORS.macd.value}`} signal="бычий" color="var(--neon-green)" bar={0.65} />
            <IndicatorRow label="Stochastic K" value={`${INDICATORS.stoch.k}`} signal="нейтрально" color="var(--neon-yellow)" bar={INDICATORS.stoch.k / 100} />
            <IndicatorRow label="ATR (14)" value={`${INDICATORS.atr.value}`} signal="волатильность" color="var(--neon-blue)" bar={0.4} />
          </div>
        </div>

        <div className="card-glow rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Icon name="Layers" size={14} style={{ color: "var(--neon-green)" }} />
            Паттерны
          </h3>
          <div className="space-y-3">
            {PATTERNS.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    name={p.direction === "up" ? "ArrowUpRight" : "ArrowDownRight"}
                    size={12}
                    style={{ color: p.direction === "up" ? "var(--neon-green)" : "var(--neon-red)" }}
                  />
                  <span className="text-sm text-white/70">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/30">{p.timeframe}</span>
                  <div className="flex items-center gap-1">
                    <div className="text-xs font-mono font-bold" style={{ color: p.reliability > 80 ? "var(--neon-green)" : "var(--neon-yellow)" }}>
                      {p.reliability}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-glow-blue rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
          <Icon name="Activity" size={14} style={{ color: "var(--neon-blue)" }} />
          Полосы Боллинджера
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Верхняя", value: INDICATORS.bb.upper.toFixed(5), color: "var(--neon-red)" },
            { label: "Средняя", value: INDICATORS.bb.middle.toFixed(5), color: "var(--neon-blue)" },
            { label: "Нижняя", value: INDICATORS.bb.lower.toFixed(5), color: "var(--neon-green)" },
          ].map((b, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-white/40 mb-1">{b.label}</div>
              <div className="font-mono font-bold text-sm" style={{ color: b.color }}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndicatorRow({ label, value, signal, color, bar }: { label: string; value: string; signal: string; color: string; bar: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/50">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/60">{value}</span>
          <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
            {signal}
          </span>
        </div>
      </div>
      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${bar * 100}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}
