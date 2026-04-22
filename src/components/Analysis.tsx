import { useState } from "react";
import Icon from "@/components/ui/icon";
import { PAIRS, PATTERNS } from "@/data/mockData";
import TradingViewWidget, { TradingViewTechnicalAnalysis } from "./TradingViewWidget";

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

export default function Analysis({ selectedPair }: { selectedPair: string }) {
  const [pair, setPair] = useState(selectedPair || "EUR/USD");
  const [tf, setTf] = useState("H1");
  const [activeTab, setActiveTab] = useState<"chart" | "analysis">("chart");

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Анализ пары</h1>
          <p className="text-sm text-white/40 mt-0.5">Реальный график TradingView + технический анализ</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={pair}
            onChange={e => setPair(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none cursor-pointer"
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
                className={`px-2.5 py-1.5 text-xs font-bold font-mono transition-all ${tf === t ? "text-black" : "text-white/40 hover:text-white/70"}`}
                style={tf === t ? { background: "var(--neon-green)" } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["chart", "analysis"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2`}
            style={activeTab === tab
              ? { background: "rgba(0,255,136,0.12)", color: "var(--neon-green)", border: "1px solid rgba(0,255,136,0.3)" }
              : { background: "transparent", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            <Icon name={tab === "chart" ? "BarChart2" : "Activity"} size={13} />
            {tab === "chart" ? "График" : "Технический анализ"}
          </button>
        ))}
      </div>

      {activeTab === "chart" && (
        <div className="card-glow rounded-xl overflow-hidden" style={{ padding: 0 }}>
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-glow)" }}>
            <span className="font-bold text-white font-mono">{pair}</span>
            <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--neon-green)" }} />
            <span className="text-xs font-mono text-white/30">LIVE · TradingView</span>
          </div>
          <TradingViewWidget pair={pair} timeframe={tf} height={460} />
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="space-y-4">
          <div className="card-glow rounded-xl overflow-hidden" style={{ padding: 0 }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-glow)" }}>
              <Icon name="Activity" size={14} style={{ color: "var(--neon-blue)" }} />
              <span className="font-semibold text-white/80 text-sm">Технический анализ TradingView · {pair}</span>
              <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--neon-green)" }} />
            </div>
            <div style={{ background: "rgba(5,13,26,0.6)" }}>
              <TradingViewTechnicalAnalysis pair={pair} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div
                        className="text-xs font-mono font-bold"
                        style={{ color: p.reliability > 80 ? "var(--neon-green)" : "var(--neon-yellow)" }}
                      >
                        {p.reliability}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-glow rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Icon name="Info" size={14} style={{ color: "var(--neon-yellow)" }} />
                Как читать сигналы
              </h3>
              <div className="space-y-3 text-sm text-white/50">
                <div className="flex gap-2">
                  <span className="tag-buy px-2 py-0.5 rounded text-xs font-mono shrink-0">BUY</span>
                  <span>Открывай длинную позицию при подтверждении сигнала на графике</span>
                </div>
                <div className="flex gap-2">
                  <span className="tag-sell px-2 py-0.5 rounded text-xs font-mono shrink-0">SELL</span>
                  <span>Открывай короткую позицию при подтверждении нисходящего тренда</span>
                </div>
                <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "rgba(0,207,255,0.06)", border: "1px solid rgba(0,207,255,0.15)", color: "var(--neon-blue)" }}>
                  Технический анализ выше — реальные данные от TradingView. Итоговый вывод «Покупать» / «Продавать» / «Нейтрально» учитывает 15+ индикаторов.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
