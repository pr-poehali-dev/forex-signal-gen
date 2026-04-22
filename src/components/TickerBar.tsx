import { useEffect, useRef } from "react";

export default function TickerBar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "FX:GBPUSD", title: "GBP/USD" },
        { proName: "FX:USDJPY", title: "USD/JPY" },
        { proName: "FX:AUDUSD", title: "AUD/USD" },
        { proName: "FX:USDCHF", title: "USD/CHF" },
        { proName: "FX:NZDUSD", title: "NZD/USD" },
        { proName: "FX:USDCAD", title: "USD/CAD" },
        { proName: "FX:EURGBP", title: "EUR/GBP" },
        { proName: "BINANCE:BTCUSDT", title: "BTC/USD" },
        { proName: "TVC:GOLD", title: "XAU/USD" },
        { proName: "BINANCE:ETHUSDT", title: "ETH/USD" },
      ],
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "ru",
    });

    containerRef.current.appendChild(script);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      className="border-b overflow-hidden"
      style={{ borderColor: "var(--border-glow)", background: "rgba(0,255,136,0.02)", height: 46 }}
    >
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ height: 46 }}
      />
    </div>
  );
}
