import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SIGNALS } from "@/data/mockData";

const TYPES = ["Все", "BUY", "SELL"];
const TIMEFRAMES = ["Все", "M15", "M30", "H1", "H4", "D1"];

const accuracyData = [78, 82, 71, 75, 85, 79, 68, 73];
const totalAccuracy = Math.round(accuracyData.reduce((a, b) => a + b, 0) / accuracyData.length);

export default function Signals() {
  const [typeFilter, setTypeFilter] = useState("Все");
  const [tfFilter, setTfFilter] = useState("Все");

  const filtered = SIGNALS.filter(s => {
    const matchType = typeFilter === "Все" || s.type === typeFilter;
    const matchTf = tfFilter === "Все" || s.tf === tfFilter;
    return matchType && matchTf;
  });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">История сигналов</h1>
          <p className="text-sm text-white/40 mt-0.5">BUY/SELL сигналы с точностью и результатами</p>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl"
          style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}
        >
          <Icon name="Target" size={16} style={{ color: "var(--neon-green)" }} />
          <div>
            <div className="text-xs text-white/40">Средняя точность</div>
            <div className="text-xl font-bold font-mono neon-text">{totalAccuracy}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Всего сигналов", value: SIGNALS.length, icon: "Zap", color: "var(--neon-blue)" },
          { label: "Прибыльных", value: "6", icon: "TrendingUp", color: "var(--neon-green)" },
          { label: "В убытке", value: "2", icon: "TrendingDown", color: "var(--neon-red)" },
        ].map((s, i) => (
          <div key={i} className="card-glow rounded-xl p-4 flex items-center gap-3">
            <Icon name={s.icon} fallback="Circle" size={20} style={{ color: s.color }} />
            <div>
              <div className="text-xs text-white/40">{s.label}</div>
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glow rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white/60 mb-3">Точность по сигналам</h3>
        <div className="flex items-end gap-1.5" style={{ height: 60 }}>
          {accuracyData.map((acc, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-mono text-white/30">{acc}%</span>
              <div
                className="w-full rounded-t bar-animate"
                style={{
                  height: `${(acc / 100) * 44}px`,
                  background: acc >= 80 ? "var(--neon-green)" : acc >= 75 ? "var(--neon-yellow)" : "var(--neon-blue)",
                  boxShadow: acc >= 80 ? "0 0 8px var(--neon-green)" : "none",
                  animationDelay: `${i * 0.08}s`
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-glow)" }}>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${typeFilter === t
                ? t === "BUY" ? "tag-buy" : t === "SELL" ? "tag-sell" : "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-glow)" }}>
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTfFilter(t)}
              className={`px-3 py-1.5 text-xs font-bold font-mono transition-all ${tfFilter === t ? "text-black" : "text-white/40 hover:text-white/70"}`}
              style={tfFilter === t ? { background: "var(--neon-green)" } : {}}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((sig, i) => (
          <div
            key={sig.id}
            className="card-glow rounded-xl px-4 py-3 flex items-center gap-3 hover:border-green-500/20 transition-all group"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono min-w-12 text-center ${sig.type === "BUY" ? "tag-buy" : "tag-sell"}`}>
              {sig.type}
            </span>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
              <span className="font-semibold text-white text-sm">{sig.pair}</span>
              <div className="font-mono text-xs text-white/50 flex items-center gap-1">
                <Icon name="Clock" size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
                {sig.time} · {sig.tf}
              </div>
              <div className="hidden md:flex flex-col gap-0.5">
                <span className="text-xs text-white/30">Вход</span>
                <span className="font-mono text-xs text-white/70">{sig.price}</span>
              </div>
              <div className="hidden md:flex flex-col gap-0.5">
                <span className="text-xs" style={{ color: "rgba(0,255,136,0.5)" }}>TP</span>
                <span className="font-mono text-xs neon-text">{sig.tp}</span>
              </div>
              <div className="hidden md:flex flex-col gap-0.5">
                <span className="text-xs neon-red" style={{ opacity: 0.5 }}>SL</span>
                <span className="font-mono text-xs neon-red">{sig.sl}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-mono font-bold text-sm ${sig.type === "BUY" ? "neon-text" : "neon-red"}`}>{sig.profit}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="text-xs font-mono text-white/30">{sig.accuracy}%</div>
                <AccuracyDots val={sig.accuracy} />
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card-glow rounded-xl p-8 text-center text-white/30">
            Нет сигналов по выбранным фильтрам
          </div>
        )}
      </div>
    </div>
  );
}

function AccuracyDots({ val }: { val: number }) {
  const filled = Math.round(val / 20);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(d => (
        <div
          key={d}
          className="w-1 h-1 rounded-full"
          style={{
            background: d <= filled
              ? val >= 80 ? "var(--neon-green)" : "var(--neon-yellow)"
              : "rgba(255,255,255,0.1)"
          }}
        />
      ))}
    </div>
  );
}
