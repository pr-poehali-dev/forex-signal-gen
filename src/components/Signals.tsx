import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { ALL_PAIRS, CATEGORIES, getPairInfo } from "@/data/pairs";
import { useMultiPrice } from "@/hooks/useRealtimePrice";
import { computeSignal } from "@/hooks/useSignalEngine";

export default function Signals() {
  const [catFilter, setCatFilter] = useState("forex_major");
  const [minConf, setMinConf] = useState(60);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "SELL" | "WAIT">("ALL");

  const displayPairs = useMemo(() =>
    ALL_PAIRS.filter(p => catFilter === "all" || p.category === catFilter).map(p => p.symbol).slice(0, 20),
    [catFilter]
  );

  const prices = useMultiPrice(displayPairs);

  const allSignals = useMemo(() =>
    displayPairs.map(sym => {
      const pd = prices[sym];
      if (!pd) return null;
      const sig = computeSignal(sym, pd);
      if (!sig) return null;
      return { sym, sig, pd };
    }).filter(Boolean),
    [prices, displayPairs]
  );

  const signals = useMemo(() =>
    allSignals.filter(s => {
      if (!s) return false;
      const matchType = typeFilter === "ALL" || s.sig.type === typeFilter;
      const matchConf = s.sig.confidence >= minConf;
      return matchType && matchConf;
    }),
    [allSignals, typeFilter, minConf]
  );

  const stats = useMemo(() => ({
    buy: allSignals.filter(s => s?.sig.type === "BUY").length,
    sell: allSignals.filter(s => s?.sig.type === "SELL").length,
    wait: allSignals.filter(s => s?.sig.type === "WAIT").length,
    avgConf: allSignals.length
      ? Math.round(allSignals.reduce((a, s) => a + (s?.sig.confidence ?? 0), 0) / allSignals.length)
      : 0,
  }), [allSignals]);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Сигналы M1 по всем парам</h1>
          <p className="text-sm text-white/40 mt-0.5">15 индикаторов · AI · реальное время · 1 минута</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
          <Icon name="Cpu" size={14} style={{ color: "var(--neon-green)" }} />
          <div>
            <div className="text-xs text-white/40">AI уверенность</div>
            <div className="text-lg font-black font-mono neon-text">{stats.avgConf}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "BUY сигналов", value: stats.buy, color: "var(--neon-green)", icon: "TrendingUp" },
          { label: "SELL сигналов", value: stats.sell, color: "var(--neon-red)", icon: "TrendingDown" },
          { label: "Ожидание", value: stats.wait, color: "var(--neon-yellow)", icon: "Minus" },
        ].map((s, i) => (
          <div key={i} className="card-glow rounded-xl p-3 flex items-center gap-3">
            <Icon name={s.icon} fallback="Circle" size={18} style={{ color: s.color }} />
            <div>
              <div className="text-xs text-white/40">{s.label}</div>
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-glow)" }}>
          {[{ id: "all", label: "Все" }, ...CATEGORIES].map(c => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className="px-3 py-1.5 text-xs font-semibold transition-all"
              style={catFilter === c.id
                ? { background: "var(--neon-green)", color: "#050d1a" }
                : { color: "rgba(255,255,255,0.4)" }
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-glow)" }}>
          {(["ALL", "BUY", "SELL", "WAIT"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 text-xs font-bold transition-all"
              style={typeFilter === t
                ? {
                    background: t === "BUY" ? "rgba(0,255,136,0.2)" : t === "SELL" ? "rgba(255,51,102,0.2)" : "rgba(255,255,255,0.1)",
                    color: t === "BUY" ? "var(--neon-green)" : t === "SELL" ? "var(--neon-red)" : "white"
                  }
                : { color: "rgba(255,255,255,0.35)" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-white/40">Мин. AI: {minConf}%</span>
          <input
            type="range" min={50} max={95} value={minConf}
            onChange={e => setMinConf(Number(e.target.value))}
            className="w-24 cursor-pointer"
            style={{ accentColor: "var(--neon-green)" }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {signals.length === 0 && (
          <div className="card-glow rounded-xl p-10 text-center">
            <Icon name="Cpu" size={28} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-white/30 text-sm">Накопление данных... подождите 30–40 секунд</p>
            <p className="text-white/20 text-xs mt-1">Алгоритму нужно минимум 35 точек для расчёта</p>
          </div>
        )}

        {signals.map((item, i) => {
          if (!item) return null;
          const { sym, sig, pd } = item;
          const pairInfo = getPairInfo(sym);
          const fmt = (v: number) => v.toFixed(pairInfo.digits);
          const isBuy = sig.type === "BUY";
          const isWait = sig.type === "WAIT";
          const sigColor = isWait ? "#ffcc00" : isBuy ? "var(--neon-green)" : "var(--neon-red)";
          const isUp = pd.changePct >= 0;
          const buyVotes = sig.indicators.filter(v => v.signal === "buy").length;
          const sellVotes = sig.indicators.filter(v => v.signal === "sell").length;

          return (
            <div
              key={sym}
              className="card-glow rounded-xl overflow-hidden transition-all hover:border-white/10"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex items-center gap-3 px-4 py-3 flex-wrap md:flex-nowrap">
                <div
                  className="font-black font-mono text-sm px-3 py-1.5 rounded-lg min-w-14 text-center shrink-0"
                  style={{ background: sigColor, color: "#050d1a" }}
                >
                  {sig.type}
                </div>

                <div className="min-w-24 shrink-0">
                  <div className="font-bold text-white text-sm">{sym}</div>
                  <div className="text-xs text-white/30 truncate">{pairInfo.label}</div>
                </div>

                <div className="min-w-28 shrink-0">
                  <div
                    className="font-mono font-bold text-sm transition-colors duration-150"
                    style={{ color: pd.direction === "up" ? "var(--neon-green)" : pd.direction === "down" ? "var(--neon-red)" : "rgba(255,255,255,0.8)" }}
                  >
                    {fmt(pd.price)}
                  </div>
                  <div className={`text-xs font-mono ${isUp ? "neon-text" : "neon-red"}`}>
                    {isUp ? "+" : ""}{pd.changePct.toFixed(3)}%
                  </div>
                </div>

                {!isWait && (
                  <div className="hidden md:flex gap-4 text-xs font-mono shrink-0">
                    <div>
                      <span className="text-white/30">TP </span>
                      <span style={{ color: "var(--neon-green)" }}>{fmt(sig.tp1)}</span>
                    </div>
                    <div>
                      <span className="text-white/30">SL </span>
                      <span style={{ color: "var(--neon-red)" }}>{fmt(sig.sl)}</span>
                    </div>
                    <div>
                      <span className="text-white/30">RR </span>
                      <span style={{ color: "var(--neon-blue)" }}>{sig.rr}</span>
                    </div>
                  </div>
                )}

                <div className="hidden md:flex items-center gap-2 flex-1">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div style={{ width: `${(buyVotes / sig.indicators.length) * 100}%`, background: "var(--neon-green)", transition: "width 0.5s" }} className="h-full" />
                    <div style={{ width: `${(sellVotes / sig.indicators.length) * 100}%`, background: "var(--neon-red)", transition: "width 0.5s" }} className="h-full" />
                  </div>
                  <span className="text-xs text-white/30 font-mono">{buyVotes}/{sig.indicators.length}</span>
                </div>

                <div className="text-right ml-auto shrink-0">
                  <div
                    className="font-mono font-black text-xl"
                    style={{ color: sig.confidence >= 80 ? "var(--neon-green)" : sig.confidence >= 65 ? "var(--neon-yellow)" : "rgba(255,255,255,0.4)" }}
                  >
                    {sig.confidence}%
                  </div>
                  <div className="text-xs text-white/30">AI</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-white/15 font-mono pt-2">
        Сигналы M1 · 15 индикаторов + AI · обновление каждые 5с · не является финансовым советом
      </div>
    </div>
  );
}
