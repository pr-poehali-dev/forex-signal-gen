import { useEffect, useRef, memo } from "react";

const TF_MAP: Record<string, string> = {
  M1: "1", M5: "5", M15: "15", M30: "30",
  H1: "60", H4: "240", D1: "D", W1: "W",
};

const SYMBOL_MAP: Record<string, string> = {
  "EUR/USD": "FX:EURUSD",
  "GBP/USD": "FX:GBPUSD",
  "USD/JPY": "FX:USDJPY",
  "AUD/USD": "FX:AUDUSD",
  "USD/CHF": "FX:USDCHF",
  "NZD/USD": "FX:NZDUSD",
  "USD/CAD": "FX:USDCAD",
  "EUR/GBP": "FX:EURGBP",
  "BTC/USD": "BINANCE:BTCUSDT",
  "ETH/USD": "BINANCE:ETHUSDT",
  "XAU/USD": "TVC:GOLD",
};

interface TradingViewWidgetProps {
  pair: string;
  timeframe: string;
  height?: number;
}

function TradingViewWidget({ pair, timeframe, height = 420 }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: SYMBOL_MAP[pair] || `FX:${pair.replace("/", "")}`,
      interval: TF_MAP[timeframe] || "60",
      timezone: "Europe/Moscow",
      theme: "dark",
      style: "1",
      locale: "ru",
      backgroundColor: "rgba(5, 13, 26, 0)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      hide_top_toolbar: false,
      hide_legend: false,
      withdateranges: true,
      range: "3M",
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      studies: [
        "STD;RSI",
        "STD;MACD",
      ],
      overrides: {
        "mainSeriesProperties.candleStyle.upColor": "#00ff88",
        "mainSeriesProperties.candleStyle.downColor": "#ff3366",
        "mainSeriesProperties.candleStyle.borderUpColor": "#00ff88",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ff3366",
        "mainSeriesProperties.candleStyle.wickUpColor": "#00ff88",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ff3366",
        "paneProperties.background": "#050d1a",
        "paneProperties.backgroundType": "solid",
        "scalesProperties.textColor": "rgba(255,255,255,0.35)",
      },
    });

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [pair, timeframe]);

  return (
    <div
      className="tradingview-widget-container rounded-xl overflow-hidden"
      ref={containerRef}
      style={{ height, width: "100%", background: "rgba(5,13,26,0.5)" }}
    />
  );
}

export default memo(TradingViewWidget);

export function TradingViewTickerTape() {
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
      ],
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "ru",
    });

    containerRef.current.appendChild(script);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: 46, overflow: "hidden" }}
    />
  );
}

export function TradingViewTechnicalAnalysis({ pair }: { pair: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1h",
      width: "100%",
      isTransparent: true,
      height: 300,
      symbol: SYMBOL_MAP[pair] || `FX:${pair.replace("/", "")}`,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "ru",
      colorTheme: "dark",
    });

    containerRef.current.appendChild(script);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [pair]);

  return (
    <div
      className="tradingview-widget-container rounded-xl overflow-hidden"
      ref={containerRef}
      style={{ minHeight: 300, background: "rgba(5,13,26,0.3)" }}
    />
  );
}
