import { useState } from "react";
import Icon from "@/components/ui/icon";

const defaultIndicators = {
  rsi: { enabled: true, period: 14, overbought: 70, oversold: 30 },
  macd: { enabled: true, fast: 12, slow: 26, signal: 9 },
  bb: { enabled: true, period: 20, deviation: 2 },
  ema: { enabled: false, period1: 20, period2: 50, period3: 200 },
  stoch: { enabled: true, k: 14, d: 3 },
  atr: { enabled: true, period: 14 },
};

const defaultSignals = {
  minAccuracy: 70,
  riskReward: 2,
  maxSL: 50,
  minPips: 30,
  notifyBuy: true,
  notifySell: true,
};

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

export default function Settings() {
  const [indicators, setIndicators] = useState(defaultIndicators);
  const [signals, setSignals] = useState(defaultSignals);
  const [activeTf, setActiveTf] = useState(["H1", "H4"]);
  const [saved, setSaved] = useState(false);

  const toggleTf = (tf: string) => {
    setActiveTf(prev => prev.includes(tf) ? prev.filter(t => t !== tf) : [...prev, tf]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки</h1>
          <p className="text-sm text-white/40 mt-0.5">Индикаторы, таймфреймы и параметры сигналов</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={saved ? { background: "rgba(0,255,136,0.2)", color: "var(--neon-green)", border: "1px solid rgba(0,255,136,0.4)" } : { background: "rgba(0,255,136,0.1)", color: "var(--neon-green)", border: "1px solid rgba(0,255,136,0.25)" }}
        >
          <Icon name={saved ? "Check" : "Save"} size={14} />
          {saved ? "Сохранено!" : "Сохранить"}
        </button>
      </div>

      <div className="card-glow rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Icon name="BarChart2" size={14} style={{ color: "var(--neon-blue)" }} />
          Индикаторы
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(indicators).map(([key, cfg]) => (
            <div key={key} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-white uppercase">{key}</span>
                <button
                  onClick={() => setIndicators(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof prev], enabled: !prev[key as keyof typeof prev].enabled } }))}
                  className="relative w-10 h-5 rounded-full transition-all"
                  style={{ background: cfg.enabled ? "var(--neon-green)" : "rgba(255,255,255,0.1)" }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: cfg.enabled ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                  />
                </button>
              </div>
              <div className="space-y-2 opacity-70">
                {Object.entries(cfg).filter(([k]) => k !== "enabled").map(([param, val]) => (
                  <div key={param} className="flex items-center justify-between">
                    <span className="text-xs text-white/40 capitalize">{param}</span>
                    <input
                      type="number"
                      defaultValue={Number(val)}
                      className="w-16 text-right text-xs font-mono bg-transparent border-b text-white/70 focus:outline-none"
                      style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glow rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Icon name="Clock" size={14} style={{ color: "var(--neon-green)" }} />
          Активные таймфреймы
        </h3>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => toggleTf(tf)}
              className="px-4 py-2 rounded-lg text-sm font-bold font-mono transition-all"
              style={activeTf.includes(tf)
                ? { background: "rgba(0,255,136,0.15)", color: "var(--neon-green)", border: "1px solid rgba(0,255,136,0.4)", boxShadow: "0 0 12px rgba(0,255,136,0.1)" }
                : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }
              }
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="card-glow rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Icon name="Zap" size={14} style={{ color: "var(--neon-yellow)" }} />
          Параметры сигналов
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Мин. точность (%)", key: "minAccuracy", min: 50, max: 100 },
            { label: "Риск/Прибыль (RR)", key: "riskReward", min: 1, max: 5 },
            { label: "Макс. стоп-лосс (pip)", key: "maxSL", min: 10, max: 200 },
            { label: "Мин. тейк-профит (pip)", key: "minPips", min: 10, max: 200 },
          ].map(field => (
            <div key={field.key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/60">{field.label}</span>
                <span className="font-mono text-sm font-bold neon-text">{signals[field.key as keyof typeof signals]}</span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={Number(signals[field.key as keyof typeof signals])}
                onChange={e => setSignals(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--neon-green) 0%, var(--neon-green) ${((Number(signals[field.key as keyof typeof signals]) - field.min) / (field.max - field.min)) * 100}%, rgba(255,255,255,0.1) ${((Number(signals[field.key as keyof typeof signals]) - field.min) / (field.max - field.min)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t flex items-center gap-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            { label: "Уведомлять о BUY", key: "notifyBuy" },
            { label: "Уведомлять о SELL", key: "notifySell" },
          ].map(opt => (
            <div key={opt.key} className="flex items-center gap-2">
              <button
                onClick={() => setSignals(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: signals[opt.key as keyof typeof signals] ? "var(--neon-green)" : "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: signals[opt.key as keyof typeof signals] ? "calc(100% - 18px)" : "2px" }}
                />
              </button>
              <span className="text-sm text-white/60">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
