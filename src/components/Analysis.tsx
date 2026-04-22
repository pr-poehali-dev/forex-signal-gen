import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { ALL_PAIRS, CATEGORIES, getPairInfo } from "@/data/pairs";
import { useRealtimePrice } from "@/hooks/useRealtimePrice";
import { useSignalEngine, SignalResult, IndicatorResult } from "@/hooks/useSignalEngine";
import TradingViewWidget from "./TradingViewWidget";

export default function Analysis({ selectedPair }: { selectedPair: string }) {
  const [pair, setPair] = useState(selectedPair || "EUR/USD");
  const [catFilter, setCatFilter] = useState<string>("forex_major");
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const pairInfo = getPairInfo(pair);
  const priceData = useRealtimePrice(pair);
  const { signal, candleCount } = useSignalEngine(pair, priceData);

  const filteredPairs = ALL_PAIRS.filter(p => {
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchSearch = !search || p.symbol.toLowerCase().includes(search.toLowerCase()) || p.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  useEffect(() => { setPair(selectedPair); }, [selectedPair]);

  const fmt = (v: number) => v.toFixed(pairInfo.digits);
  const isUp = priceData.direction === "up";
  const isDown = priceData.direction === "down";
  const priceColor = isUp ? "var(--neon-green)" : isDown ? "var(--neon-red)" : "rgba(255,255,255,0.9)";
  const readyPct = Math.min(100, Math.round((candleCount / 35) * 100));
  const isReady = candleCount >= 35;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Анализ M1</h1>
          <p className="text-sm text-white/40 mt-0.5">15 индикаторов · AI-взвешивание · обновление каждую секунду</p>
        </div>
        <button
          onClick={() => setShowPicker(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-mono transition-all"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-glow)", color: "var(--neon-green)" }}
        >
          <Icon name="Search" size={14} />
          {pair}
          <Icon name={showPicker ? "ChevronUp" : "ChevronDown"} size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      </div>

      {showPicker && (
        <div className="card-glow rounded-xl p-4 space-y-3 animate-fade-in">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск пары... EUR/USD, Bitcoin..."
            className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
            style={{ borderColor: "var(--border-glow)" }}
          />
          <div className="flex flex-wrap gap-1.5">
            {[{ id: "all", label: "Все" }, ...CATEGORIES].map(c => (
              <button
                key={c.id}
                onClick={() => { setCatFilter(c.id); setSearch(""); }}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={catFilter === c.id
                  ? { background: "rgba(0,255,136,0.15)", color: "var(--neon-green)", border: "1px solid rgba(0,255,136,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 max-h-52 overflow-y-auto pr-1">
            {filteredPairs.map(p => (
              <button
                key={p.symbol}
                onClick={() => { setPair(p.symbol); setShowPicker(false); setSearch(""); }}
                className="text-left px-3 py-2 rounded-lg text-xs transition-all"
                style={pair === p.symbol
                  ? { background: "rgba(0,255,136,0.12)", color: "var(--neon-green)", border: "1px solid rgba(0,255,136,0.25)" }
                  : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.05)" }
                }
              >
                <div className="font-bold font-mono">{p.symbol}</div>
                <div className="text-white/30 truncate mt-0.5">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Цена LIVE */}
      <div className="card-glow rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs text-white/40 mb-1 font-mono flex items-center gap-2">
              <div className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--neon-green)" }} />
              LIVE · обновляется каждую секунду
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-black font-mono transition-colors duration-150"
                style={{ color: priceColor, textShadow: isUp ? "0 0 20px rgba(0,255,136,0.4)" : isDown ? "0 0 20px rgba(255,51,102,0.4)" : "none" }}
              >
                {fmt(priceData.price)}
              </span>
              <span className={`text-sm font-bold font-mono ${priceData.changePct >= 0 ? "neon-text" : "neon-red"}`}>
                {priceData.changePct >= 0 ? "+" : ""}{priceData.changePct.toFixed(3)}%
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-xs font-mono text-white/40">
              <span>BID: <span className="text-white/60">{fmt(priceData.bid)}</span></span>
              <span>ASK: <span className="text-white/60">{fmt(priceData.ask)}</span></span>
              <span>Спред: <span className="text-white/60">{(priceData.spread / pairInfo.pipSize).toFixed(1)} pip</span></span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: "High", v: fmt(priceData.high), c: "var(--neon-green)" },
              { l: "Open", v: fmt(priceData.open), c: "rgba(255,255,255,0.6)" },
              { l: "Low", v: fmt(priceData.low), c: "var(--neon-red)" },
            ].map(x => (
              <div key={x.l} className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-xs text-white/30">{x.l}</div>
                <div className="font-mono font-bold text-sm" style={{ color: x.c }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Сигнал */}
      {!isReady ? (
        <div className="card-glow rounded-xl p-6 text-center">
          <Icon name="Cpu" size={28} className="mx-auto mb-3" style={{ color: "var(--neon-blue)" }} />
          <div className="text-white/70 font-semibold mb-2">Сбор данных для анализа...</div>
          <div className="text-white/40 text-sm mb-3">{pair}: {candleCount}/35 точек накоплено</div>
          <div className="h-1.5 rounded-full mx-auto max-w-xs" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${readyPct}%`, background: "var(--neon-green)" }} />
          </div>
        </div>
      ) : signal ? (
        <SignalCard signal={signal} pair={pair} digits={pairInfo.digits} pipSize={pairInfo.pipSize} />
      ) : null}

      {/* TradingView график */}
      <div className="card-glow rounded-xl overflow-hidden" style={{ padding: 0 }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-glow)" }}>
          <Icon name="BarChart2" size={14} style={{ color: "var(--neon-blue)" }} />
          <span className="font-semibold text-white/80 text-sm">График · {pair} · M1</span>
          <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--neon-green)" }} />
          <span className="text-xs font-mono text-white/30">TradingView</span>
        </div>
        <TradingViewWidget pair={pair} timeframe="M1" height={360} />
      </div>

      {/* 15 индикаторов */}
      {signal && (
        <div className="card-glow rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Icon name="Activity" size={14} style={{ color: "var(--neon-blue)" }} />
            15 индикаторов · AI-взвешивание
            <span className="ml-auto text-xs font-mono text-white/30">каждые 5с</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {signal.indicators.map((ind, i) => (
              <IndicatorRow key={i} ind={ind} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal, pair, digits, pipSize }: { signal: SignalResult; pair: string; digits: number; pipSize: number }) {
  const [timeLeft, setTimeLeft] = useState(signal.validity);

  useEffect(() => {
    setTimeLeft(signal.validity);
    const t = setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [signal.generatedAt]);

  const isBuy = signal.type === "BUY";
  const isWait = signal.type === "WAIT";
  const sigColor = isWait ? "#ffcc00" : isBuy ? "var(--neon-green)" : "var(--neon-red)";
  const sigBorder = isWait ? "rgba(255,204,0,0.3)" : isBuy ? "rgba(0,255,136,0.3)" : "rgba(255,51,102,0.3)";
  const sigBg = isWait ? "rgba(255,204,0,0.05)" : isBuy ? "rgba(0,255,136,0.05)" : "rgba(255,51,102,0.05)";

  const fmt = (v: number) => v.toFixed(digits);
  const buyVotes = signal.indicators.filter(i => i.signal === "buy").length;
  const sellVotes = signal.indicators.filter(i => i.signal === "sell").length;
  const neutralVotes = signal.indicators.length - buyVotes - sellVotes;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sigBorder}`, background: sigBg }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: `${sigBorder}60` }}>
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black font-mono px-4 py-1.5 rounded-lg" style={{ background: sigColor, color: "#050d1a" }}>
            {signal.type}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{pair} · M1 · 1 минута</div>
            <div className="text-xs text-white/40 capitalize">{signal.strength} · {signal.trend}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black font-mono" style={{ color: sigColor }}>{signal.confidence}%</div>
          <div className="text-xs text-white/40">уверенность AI</div>
        </div>
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: `${sigBorder}30`, background: "rgba(0,0,0,0.1)" }}>
        <div className="flex items-start gap-2">
          <Icon name="Cpu" size={13} style={{ color: sigColor, marginTop: 2, flexShrink: 0 }} />
          <p className="text-sm text-white/70">{signal.aiVerdict}</p>
        </div>
      </div>

      {!isWait && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 border-b" style={{ borderColor: `${sigBorder}30` }}>
          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="text-xs text-white/40 mb-1">Вход M1</div>
            <div className="font-mono font-bold text-white">{fmt(signal.entry)}</div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(0,255,136,0.06)" }}>
            <div className="text-xs" style={{ color: "rgba(0,255,136,0.5)" }}>TP +{signal.pips} pip</div>
            <div className="font-mono font-bold" style={{ color: "var(--neon-green)" }}>{fmt(signal.tp1)}</div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(255,51,102,0.06)" }}>
            <div className="text-xs" style={{ color: "rgba(255,51,102,0.5)" }}>Stop Loss</div>
            <div className="font-mono font-bold" style={{ color: "var(--neon-red)" }}>{fmt(signal.sl)}</div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(0,207,255,0.06)" }}>
            <div className="text-xs" style={{ color: "rgba(0,207,255,0.5)" }}>Risk/Reward</div>
            <div className="font-mono font-bold" style={{ color: "var(--neon-blue)" }}>{signal.rr}</div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: "var(--neon-green)" }}>BUY: {buyVotes}</span>
            <span className="text-white/30">нейтр: {neutralVotes}</span>
            <span style={{ color: "var(--neon-red)" }}>SELL: {sellVotes}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex gap-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div style={{ width: `${(buyVotes / signal.indicators.length) * 100}%`, background: "var(--neon-green)", transition: "width 0.5s" }} className="h-full rounded-l" />
            <div style={{ width: `${(neutralVotes / signal.indicators.length) * 100}%`, background: "rgba(255,255,255,0.1)", transition: "width 0.5s" }} className="h-full" />
            <div style={{ width: `${(sellVotes / signal.indicators.length) * 100}%`, background: "var(--neon-red)", transition: "width 0.5s" }} className="h-full rounded-r" />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-white/30 mb-0.5">действителен</div>
          <div className="font-mono font-bold text-lg" style={{ color: timeLeft > 20 ? sigColor : "var(--neon-red)" }}>{timeLeft}с</div>
        </div>
      </div>
    </div>
  );
}

function IndicatorRow({ ind }: { ind: IndicatorResult }) {
  const sigColor = ind.signal === "buy" ? "var(--neon-green)" : ind.signal === "sell" ? "var(--neon-red)" : "var(--neon-yellow)";
  const barWidth = Math.min(100, Math.abs(ind.score) * 100);
  const isPos = ind.score >= 0;

  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sigColor }} />
          <span className="text-xs font-semibold text-white/70">{ind.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-white/40">{String(ind.value)}</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded font-mono"
            style={{ color: sigColor, background: `${sigColor}15`, border: `1px solid ${sigColor}20` }}
          >
            {ind.signal === "buy" ? "BUY" : ind.signal === "sell" ? "SELL" : "—"}
          </span>
        </div>
      </div>
      <div className="h-1 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${barWidth}%`,
            background: sigColor,
            marginLeft: isPos ? "auto" : undefined,
            float: isPos ? "right" : "left",
          }}
        />
      </div>
      <div className="text-xs text-white/30 truncate">{ind.description}</div>
    </div>
  );
}
