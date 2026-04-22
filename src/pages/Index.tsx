import { useState } from "react";
import Icon from "@/components/ui/icon";
import TickerBar from "@/components/TickerBar";
import Dashboard from "@/components/Dashboard";
import Analysis from "@/components/Analysis";
import Signals from "@/components/Signals";
import Settings from "@/components/Settings";

type Tab = "dashboard" | "analysis" | "signals" | "settings";

const NAV = [
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
  { id: "analysis", label: "Анализ", icon: "LineChart" },
  { id: "signals", label: "Сигналы", icon: "Zap" },
  { id: "settings", label: "Настройки", icon: "SlidersHorizontal" },
] as const;

export default function Index() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedPair, setSelectedPair] = useState("EUR/USD");
  const [favorites, setFavorites] = useState<string[]>(["EUR/USD", "GBP/USD"]);

  const toggleFavorite = (pair: string) => {
    setFavorites(prev => prev.includes(pair) ? prev.filter(p => p !== pair) : [...prev, pair]);
  };

  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    setTab("analysis");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-deep)" }}>
      <header className="border-b sticky top-0 z-40" style={{ borderColor: "var(--border-glow)", background: "rgba(5,13,26,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--neon-green), rgba(0,207,255,0.6))" }}>
              <Icon name="TrendingUp" size={14} className="text-black" />
            </div>
            <span className="font-black text-white text-sm tracking-wide">TRADE<span style={{ color: "var(--neon-green)" }}>SIGNAL</span></span>
            <span className="hidden md:block text-xs font-mono text-white/20 border-l pl-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>PRO</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === n.id ? "nav-active" : "text-white/40 hover:text-white/70"}`}
              >
                <Icon name={n.icon} fallback="Circle" size={14} />
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--neon-green)" }} />
            <span className="text-xs font-mono text-white/30">22 APR 2026</span>
          </div>
        </div>
      </header>

      <TickerBar />

      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-14 border-r py-4 items-center gap-2 sticky top-[89px] h-[calc(100vh-89px)]" style={{ borderColor: "var(--border-glow)", background: "rgba(10,22,40,0.5)" }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${tab === n.id ? "" : "hover:bg-white/5"}`}
              style={tab === n.id ? { background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" } : {}}
              title={n.label}
            >
              <Icon name={n.icon} fallback="Circle" size={16} style={{ color: tab === n.id ? "var(--neon-green)" : "rgba(255,255,255,0.3)" }} />
            </button>
          ))}
          <div className="flex-1" />
          {favorites.length > 0 && (
            <div className="w-9 flex flex-col items-center gap-1">
              <div className="w-6 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
              {favorites.slice(0, 3).map(fav => (
                <button
                  key={fav}
                  onClick={() => handleSelectPair(fav)}
                  className="w-9 h-7 rounded hover:bg-white/5 transition-all"
                  title={fav}
                  style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }}
                >
                  {fav.replace("/", "")}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="flex-1 p-4 md:p-6 max-w-5xl">
          {tab === "dashboard" && (
            <Dashboard
              onSelectPair={handleSelectPair}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onGoSignals={() => setTab("signals")}
            />
          )}
          {tab === "analysis" && <Analysis selectedPair={selectedPair} />}
          {tab === "signals" && <Signals />}
          {tab === "settings" && <Settings />}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t z-40 flex" style={{ borderColor: "var(--border-glow)", background: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all`}
            style={{ color: tab === n.id ? "var(--neon-green)" : "rgba(255,255,255,0.3)" }}
          >
            <Icon name={n.icon} fallback="Circle" size={18} />
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
