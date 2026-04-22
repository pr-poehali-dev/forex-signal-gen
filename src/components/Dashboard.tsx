import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { ALL_PAIRS, getPairInfo } from "@/data/pairs";
import { useMultiPrice } from "@/hooks/useRealtimePrice";
import { computeSignal } from "@/hooks/useSignalEngine";

const MAJOR_PAIRS = ALL_PAIRS.filter(p => p.category === "forex_major");

export default function Dashboard({ onSelectPair, favorites, toggleFavorite, onGoSignals }: {
  onSelectPair: (pair: string) => void;
  favorites: string[];
  toggleFavorite: (pair: string) => void;
  onGoSignals: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "fav">("all");

  const displayPairs = filter === "fav"
    ? ALL_PAIRS.filter(p => favorites.includes(p.symbol))
    : MAJOR_PAIRS;

  const symbols = displayPairs.map(p => p.symbol);
  const prices = useMultiPrice(symbols);

  const signalSummary = useMemo(() => {
    const sigs = symbols.map(s => {
      const pd = prices[s];
      if (!pd) return null;
      return computeSignal(s, pd);
    }).filter(Boolean);
    return {
      total: sigs.length,
      buy: sigs.filter(s => s?.type === "BUY").length,
      sell: sigs.filter(s => s?.type === "SELL").length,
      avgConf: sigs.length ? Math.round(sigs.reduce((a, s) => a + (s?.confidence ?? 0), 0) / sigs.length) : 0,
    };
  }, [prices, symbols]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Рынок сейчас</h1>
          <p className="text-sm text-white/40 mt-0.5">Цены обновляются каждую секунду</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--neon-green)" }} />
          <span className="text-xs font-mono text-white/50">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "BUY сигналов", value: String(signalSummary.buy), icon: "TrendingUp", color: "var(--neon-green)" },
          { label: "AI уверенность", value: `${signalSummary.avgConf}%`, icon: "Cpu", color: "var(--neon-blue)" },
          { label: "SELL сигналов", value: String(signalSummary.sell), icon: "TrendingDown", color: "var(--neon-red)" },
          { label: "Избранных", value: String(favorites.length), icon: "Star", color: "var(--neon-yellow)" },
        ].map((stat, i) => (
          <div key={i} className="card-glow rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">{stat.label}</span>
              <Icon name={stat.icon} fallback="Circle" size={14} style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-white/70">Валютные пары</span>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-glow)" }}>
          {(["all", "fav"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-xs font-semibold transition-all"
              style={filter === f
                ? { background: "rgba(0,255,136,0.1)", color: "var(--neon-green)" }
                : { color: "rgba(255,255,255,0.4)" }
              }
            >
              {f === "all" ? "Мажоры" : "Избранные"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayPairs.map((pair) => {
          const pd = prices[pair.symbol];
          const sig = pd ? computeSignal(pair.symbol, pd) : null;
          const isFav = favorites.includes(pair.symbol);
          const fmt = (v: number) => v.toFixed(pair.digits);
          const isUp = (pd?.changePct ?? 0) >= 0;

          return (
            <div
              key={pair.symbol}
              onClick={() => onSelectPair(pair.symbol)}
              className="card-glow rounded-xl p-4 cursor-pointer hover:border-green-500/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(pair.symbol); }}
                    className="transition-all hover:scale-110"
                  >
                    <Icon
                      name="Star"
                      size={14}
                      style={{ color: isFav ? "var(--neon-yellow)" : "rgba(255,255,255,0.2)", fill: isFav ? "var(--neon-yellow)" : "transparent" }}
                    />
                  </button>
                  <div>
                    <div className="font-bold text-white text-sm">{pair.symbol}</div>
                    <div className="text-xs text-white/30">{pair.label}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Сигнал */}
                  {sig && sig.type !== "WAIT" && (
                    <div
                      className="text-xs font-black font-mono px-2 py-0.5 rounded"
                      style={{
                        background: sig.type === "BUY" ? "rgba(0,255,136,0.15)" : "rgba(255,51,102,0.15)",
                        color: sig.type === "BUY" ? "var(--neon-green)" : "var(--neon-red)",
                        border: `1px solid ${sig.type === "BUY" ? "rgba(0,255,136,0.3)" : "rgba(255,51,102,0.3)"}`,
                      }}
                    >
                      {sig.type} {sig.confidence}%
                    </div>
                  )}

                  <div className="text-right">
                    {pd ? (
                      <>
                        <div
                          className="text-sm font-bold font-mono transition-colors duration-150"
                          style={{ color: pd.direction === "up" ? "var(--neon-green)" : pd.direction === "down" ? "var(--neon-red)" : "rgba(255,255,255,0.8)" }}
                        >
                          {fmt(pd.price)}
                        </div>
                        <div className={`text-xs font-mono ${isUp ? "neon-text" : "neon-red"}`}>
                          {isUp ? "+" : ""}{pd.changePct.toFixed(3)}%
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-white/20 font-mono">загрузка...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {displayPairs.length === 0 && (
          <div className="col-span-2 card-glow rounded-xl p-8 text-center text-white/30">
            <Icon name="Star" size={32} className="mx-auto mb-2 opacity-20" />
            <p>Нет избранных пар. Нажмите ★ рядом с парой.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/70">AI сигналы M1</span>
        <button onClick={onGoSignals} className="text-xs font-mono neon-text hover:opacity-80 transition-opacity">
          Все сигналы →
        </button>
      </div>

      <div className="card-glow rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Cpu" size={14} style={{ color: "var(--neon-blue)" }} />
          <span className="text-sm text-white/60">Алгоритм использует 15 индикаторов + AI-взвешивание</span>
        </div>
        <div className="flex gap-4 flex-wrap">
          {["RSI", "MACD", "EMA 8/21/50/200", "Bollinger", "Stochastic", "CCI", "Williams %R", "Momentum", "ROC", "Vortex", "ADX", "Price Action"].map(ind => (
            <span key={ind} className="text-xs font-mono px-2 py-1 rounded" style={{ background: "rgba(0,207,255,0.08)", color: "rgba(0,207,255,0.6)", border: "1px solid rgba(0,207,255,0.15)" }}>
              {ind}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
