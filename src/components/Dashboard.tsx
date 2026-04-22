import { useState } from "react";
import MiniChart from "./MiniChart";
import Icon from "@/components/ui/icon";
import { PAIRS, SIGNALS, generateLine } from "@/data/mockData";

const pairCharts = PAIRS.map(p => generateLine(p.price, 24, p.change > 0 ? 1 : -1));

export default function Dashboard({ onSelectPair, favorites, toggleFavorite, onGoSignals }: {
  onSelectPair: (pair: string) => void;
  favorites: string[];
  toggleFavorite: (pair: string) => void;
  onGoSignals: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "fav">("all");
  const activePairs = filter === "fav" ? PAIRS.filter(p => favorites.includes(p.symbol)) : PAIRS;
  const activeSignals = SIGNALS.filter((_, i) => i < 3);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Рынок сейчас</h1>
          <p className="text-sm text-white/40 mt-0.5">Обзор валютных пар и активных сигналов</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--neon-green)" }} />
          <span className="text-xs font-mono text-white/50">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Активных сигналов", value: "8", icon: "Zap", color: "var(--neon-green)" },
          { label: "Точность сегодня", value: "78%", icon: "Target", color: "var(--neon-blue)" },
          { label: "Прибыльных", value: "6/8", icon: "TrendingUp", color: "var(--neon-green)" },
          { label: "Избранных пар", value: String(favorites.length), icon: "Star", color: "var(--neon-yellow)" },
        ].map((stat, i) => (
          <div key={i} className="card-glow rounded-xl p-4" style={{ animationDelay: `${i * 0.08}s` }}>
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
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${filter === f ? "bg-green-500/10 text-green-400" : "text-white/40 hover:text-white/70"}`}
            >
              {f === "all" ? "Все" : "Избранные"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activePairs.map((pair, i) => {
          const chartData = pairCharts[PAIRS.indexOf(pair)];
          const isUp = pair.change >= 0;
          const isFav = favorites.includes(pair.symbol);
          return (
            <div
              key={pair.symbol}
              onClick={() => onSelectPair(pair.symbol)}
              className="card-glow rounded-xl p-4 cursor-pointer group transition-all hover:border-green-500/30"
              style={{ animationDelay: `${i * 0.05}s` }}
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
                    <div className="font-mono text-xs text-white/40">{pair.price.toFixed(pair.price > 100 ? 2 : 5)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MiniChart data={chartData} color="auto" width={80} height={36} />
                  <div className="text-right">
                    <div className={`text-sm font-bold font-mono ${isUp ? "neon-text" : "neon-red"}`}>
                      {isUp ? "+" : ""}{pair.change}%
                    </div>
                    <Icon name={isUp ? "TrendingUp" : "TrendingDown"} size={12} style={{ color: isUp ? "var(--neon-green)" : "var(--neon-red)" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {activePairs.length === 0 && (
          <div className="col-span-2 card-glow rounded-xl p-8 text-center text-white/30">
            <Icon name="Star" size={32} className="mx-auto mb-2 opacity-20" />
            <p>Нет избранных пар. Нажмите ★ рядом с парой.</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white/70">Последние сигналы</span>
          <button onClick={onGoSignals} className="text-xs font-mono neon-text hover:opacity-80 transition-opacity">
            Все сигналы →
          </button>
        </div>
        <div className="space-y-2">
          {activeSignals.map((sig, i) => (
            <div key={sig.id} className="card-glow rounded-xl px-4 py-3 flex items-center gap-4" style={{ animationDelay: `${i * 0.07}s` }}>
              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${sig.type === "BUY" ? "tag-buy" : "tag-sell"}`}>
                {sig.type}
              </span>
              <span className="text-sm font-semibold text-white w-20">{sig.pair}</span>
              <span className="text-xs font-mono text-white/40 w-8">{sig.tf}</span>
              <span className="text-xs font-mono text-white/60 flex-1">{sig.price}</span>
              <span className={`text-xs font-mono font-bold ${sig.type === "BUY" ? "neon-text" : "neon-red"}`}>{sig.profit}</span>
              <div className="flex items-center gap-1">
                <div className="text-xs text-white/30 font-mono">{sig.accuracy}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}