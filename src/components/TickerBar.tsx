const tickers = [
  { pair: "EUR/USD", price: "1.08432", change: "+0.12%", up: true },
  { pair: "BTC/USD", price: "67,412.50", change: "-1.34%", up: false },
  { pair: "GBP/USD", price: "1.26741", change: "+0.08%", up: true },
  { pair: "XAU/USD", price: "2,341.20", change: "+0.55%", up: true },
  { pair: "ETH/USD", price: "3,512.80", change: "-0.89%", up: false },
  { pair: "USD/JPY", price: "154.320", change: "-0.21%", up: false },
  { pair: "USD/CHF", price: "0.89812", change: "+0.07%", up: true },
  { pair: "AUD/USD", price: "0.65233", change: "+0.31%", up: true },
];

export default function TickerBar() {
  const doubled = [...tickers, ...tickers];
  return (
    <div className="overflow-hidden border-b" style={{ borderColor: "var(--border-glow)", background: "rgba(0,255,136,0.03)" }}>
      <div className="flex ticker-scroll" style={{ width: "max-content" }}>
        {doubled.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-6 py-2 border-r" style={{ borderColor: "rgba(255,255,255,0.05)", minWidth: 180 }}>
            <span className="text-xs font-semibold text-white/60 font-mono">{t.pair}</span>
            <span className="text-xs font-mono font-semibold text-white">{t.price}</span>
            <span className={`text-xs font-mono font-bold ${t.up ? "neon-text" : "neon-red"}`}>
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
