import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

const TYPES = ["Все", "BUY", "SELL"];
const TIMEFRAMES_FILTER = ["Все", "M15", "H1", "H4", "D1"];

interface Signal {
  id: number;
  pair: string;
  type: "BUY" | "SELL";
  tf: string;
  price: string;
  tp: string;
  sl: string;
  time: string;
  accuracy: number;
  profit: string;
  rr: string;
  confirmations: string[];
  status: "active" | "closed_win" | "closed_loss";
}

const SIGNALS_RAW: Signal[] = [
  {
    id: 1, pair: "EUR/USD", type: "BUY", tf: "H4", price: "1.08341", tp: "1.08980", sl: "1.08010",
    time: "14:32", accuracy: 87, profit: "+63 pip", rr: "1:2.0",
    confirmations: ["RSI > 50", "MACD бычий", "EMA 20 > EMA 50", "Поддержка пробита вверх"],
    status: "active",
  },
  {
    id: 2, pair: "GBP/USD", type: "SELL", tf: "H4", price: "1.27012", tp: "1.26400", sl: "1.27340",
    time: "13:15", accuracy: 82, profit: "+61 pip", rr: "1:1.9",
    confirmations: ["RSI < 50", "MACD медвежий", "Уровень сопротивления", "Divergence RSI"],
    status: "active",
  },
  {
    id: 3, pair: "USD/JPY", type: "BUY", tf: "H1", price: "154.120", tp: "154.820", sl: "153.770",
    time: "12:47", accuracy: 79, profit: "+70 pip", rr: "1:2.0",
    confirmations: ["Тренд восходящий", "EMA 50 поддержка", "MACD нулевая линия"],
    status: "closed_win",
  },
  {
    id: 4, pair: "XAU/USD", type: "BUY", tf: "D1", price: "2341.50", tp: "2380.00", sl: "2318.00",
    time: "09:00", accuracy: 91, profit: "+38.5$", rr: "1:1.7",
    confirmations: ["D1 тренд вверх", "RSI 55 нейтр.", "Breakout уровня", "Объёмы растут", "EMA 200 поддержка"],
    status: "active",
  },
  {
    id: 5, pair: "AUD/USD", type: "SELL", tf: "H1", price: "0.65410", tp: "0.64980", sl: "0.65640",
    time: "11:20", accuracy: 75, profit: "+43 pip", rr: "1:1.9",
    confirmations: ["RSI перекуплен", "Медвежий паттерн"],
    status: "closed_win",
  },
  {
    id: 6, pair: "EUR/GBP", type: "BUY", tf: "D1", price: "0.85210", tp: "0.85900", sl: "0.84870",
    time: "09:00", accuracy: 85, profit: "+69 pip", rr: "1:2.0",
    confirmations: ["D1 разворот", "Молот на поддержке", "RSI перепродан"],
    status: "active",
  },
  {
    id: 7, pair: "NZD/USD", type: "BUY", tf: "H4", price: "0.59980", tp: "0.60650", sl: "0.59640",
    time: "07:15", accuracy: 72, profit: "+67 pip", rr: "1:2.0",
    confirmations: ["MACD бычий", "Уровень поддержки"],
    status: "closed_loss",
  },
  {
    id: 8, pair: "USD/CAD", type: "SELL", tf: "H4", price: "1.35890", tp: "1.35100", sl: "1.36270",
    time: "06:45", accuracy: 80, profit: "+79 pip", rr: "1:2.1",
    confirmations: ["Тренд нисходящий", "RSI < 45", "EMA пересечение вниз", "Объёмы подтверждают"],
    status: "closed_win",
  },
];

const STATUS_LABELS: Record<Signal["status"], { label: string; color: string; bg: string }> = {
  active: { label: "Активен", color: "var(--neon-green)", bg: "rgba(0,255,136,0.1)" },
  closed_win: { label: "Закрыт ✓", color: "var(--neon-blue)", bg: "rgba(0,207,255,0.08)" },
  closed_loss: { label: "Стоп", color: "var(--neon-red)", bg: "rgba(255,51,102,0.08)" },
};

export default function Signals() {
  const [typeFilter, setTypeFilter] = useState("Все");
  const [tfFilter, setTfFilter] = useState("Все");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => SIGNALS_RAW.filter(s => {
    const matchType = typeFilter === "Все" || s.type === typeFilter;
    const matchTf = tfFilter === "Все" || s.tf === tfFilter;
    return matchType && matchTf;
  }), [typeFilter, tfFilter]);

  const stats = useMemo(() => {
    const wins = SIGNALS_RAW.filter(s => s.status === "closed_win").length;
    const losses = SIGNALS_RAW.filter(s => s.status === "closed_loss").length;
    const active = SIGNALS_RAW.filter(s => s.status === "active").length;
    const avg = Math.round(SIGNALS_RAW.reduce((a, s) => a + s.accuracy, 0) / SIGNALS_RAW.length);
    return { wins, losses, active, avg };
  }, []);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Сигналы</h1>
          <p className="text-sm text-white/40 mt-0.5">Мульти-таймфрейм анализ · RSI + MACD + EMA + Price Action</p>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl"
          style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}
        >
          <Icon name="Target" size={16} style={{ color: "var(--neon-green)" }} />
          <div>
            <div className="text-xs text-white/40">Ср. точность</div>
            <div className="text-xl font-bold font-mono neon-text">{stats.avg}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Активных", value: stats.active, color: "var(--neon-green)", icon: "Zap" },
          { label: "Закрыто +", value: stats.wins, color: "var(--neon-blue)", icon: "TrendingUp" },
          { label: "По стопу", value: stats.losses, color: "var(--neon-red)", icon: "TrendingDown" },
          { label: "Мин. RR", value: "1:1.9", color: "var(--neon-yellow)", icon: "Scale" },
        ].map((s, i) => (
          <div key={i} className="card-glow rounded-xl p-4 flex items-center gap-3">
            <Icon name={s.icon} fallback="Circle" size={18} style={{ color: s.color }} />
            <div>
              <div className="text-xs text-white/40">{s.label}</div>
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glow rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
          <Icon name="Shield" size={13} style={{ color: "var(--neon-green)" }} />
          Алгоритм точности сигнала
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/50">
          {[
            { icon: "BarChart2", title: "Мульти-ТФ", desc: "Сигнал подтверждается на 3 таймфреймах одновременно" },
            { icon: "Activity", title: "5+ индикаторов", desc: "RSI, MACD, EMA 20/50/200, Stochastic, Bollinger" },
            { icon: "Crosshair", title: "Price Action", desc: "Свечные паттерны + уровни поддержки/сопротивления" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <Icon name={item.icon} fallback="Circle" size={14} style={{ color: "var(--neon-blue)", flexShrink: 0, marginTop: 1 }} />
              <div>
                <div className="font-semibold text-white/70 mb-0.5">{item.title}</div>
                <div>{item.desc}</div>
              </div>
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
          {TIMEFRAMES_FILTER.map(t => (
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
        {filtered.map((sig, i) => {
          const isOpen = expanded === sig.id;
          const st = STATUS_LABELS[sig.status];
          return (
            <div
              key={sig.id}
              className="card-glow rounded-xl overflow-hidden transition-all"
              style={{ animationDelay: `${i * 0.05}s`, borderColor: isOpen ? "rgba(0,255,136,0.25)" : undefined }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-all"
                onClick={() => setExpanded(isOpen ? null : sig.id)}
              >
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono min-w-12 text-center ${sig.type === "BUY" ? "tag-buy" : "tag-sell"}`}>
                  {sig.type}
                </span>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                  <span className="font-semibold text-white text-sm">{sig.pair}</span>
                  <div className="font-mono text-xs text-white/50 flex items-center gap-1">
                    <Icon name="Clock" size={10} style={{ color: "rgba(255,255,255,0.25)" }} />
                    {sig.time} · {sig.tf}
                  </div>
                  <div className="hidden md:flex flex-col gap-0.5">
                    <span className="text-xs text-white/30">Вход</span>
                    <span className="font-mono text-xs text-white/70">{sig.price}</span>
                  </div>
                  <div className="hidden md:flex gap-3">
                    <div>
                      <span className="text-xs" style={{ color: "rgba(0,255,136,0.4)" }}>TP </span>
                      <span className="font-mono text-xs neon-text">{sig.tp}</span>
                    </div>
                    <div>
                      <span className="text-xs neon-red" style={{ opacity: 0.5 }}>SL </span>
                      <span className="font-mono text-xs neon-red">{sig.sl}</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs font-mono text-white/30">{sig.rr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="hidden md:flex px-2 py-0.5 rounded text-xs font-mono font-semibold"
                    style={{ color: st.color, background: st.bg }}
                  >
                    {st.label}
                  </div>
                  <div className="text-right">
                    <AccuracyBadge val={sig.accuracy} />
                  </div>
                  <Icon
                    name={isOpen ? "ChevronUp" : "ChevronDown"}
                    size={14}
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Подтверждения сигнала</div>
                      <div className="space-y-1.5">
                        {sig.confirmations.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-2 text-sm text-white/60">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--neon-green)" }} />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wider">Параметры</div>
                      {[
                        { label: "Вход", value: sig.price },
                        { label: "Тейк-профит", value: sig.tp, color: "var(--neon-green)" },
                        { label: "Стоп-лосс", value: sig.sl, color: "var(--neon-red)" },
                        { label: "Risk/Reward", value: sig.rr, color: "var(--neon-yellow)" },
                        { label: "Прибыль", value: sig.profit, color: sig.type === "BUY" ? "var(--neon-green)" : "var(--neon-red)" },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between text-sm">
                          <span className="text-white/40">{row.label}</span>
                          <span className="font-mono font-semibold" style={{ color: row.color || "rgba(255,255,255,0.7)" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card-glow rounded-xl p-8 text-center text-white/30">
            Нет сигналов по выбранным фильтрам
          </div>
        )}
      </div>
    </div>
  );
}

function AccuracyBadge({ val }: { val: number }) {
  const color = val >= 85 ? "var(--neon-green)" : val >= 78 ? "var(--neon-yellow)" : "var(--neon-blue)";
  return (
    <div
      className="font-mono font-bold text-sm px-2 py-0.5 rounded"
      style={{ color, background: `${color}12`, border: `1px solid ${color}30` }}
    >
      {val}%
    </div>
  );
}
