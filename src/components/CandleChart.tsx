import { useMemo } from "react";

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

interface CandleChartProps {
  candles: Candle[];
  width?: number;
  height?: number;
}

export default function CandleChart({ candles, width = 520, height = 200 }: CandleChartProps) {
  const { normalizedCandles, priceLines } = useMemo(() => {
    const allPrices = candles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const range = max - min || 1;
    const pad = 16;
    const chartH = height - pad * 2;

    const norm = (v: number) => pad + chartH - ((v - min) / range) * chartH;

    const candleW = (width / candles.length) * 0.55;
    const step = width / candles.length;

    const normalized = candles.map((c, i) => ({
      x: i * step + step * 0.5,
      openY: norm(c.open),
      closeY: norm(c.close),
      highY: norm(c.high),
      lowY: norm(c.low),
      isGreen: c.close >= c.open,
      w: candleW,
    }));

    const lines = [0, 0.25, 0.5, 0.75, 1].map(t => ({
      y: pad + chartH * t,
      price: (max - (max - min) * t).toFixed(2),
    }));

    return { normalizedCandles: normalized, priceLines: lines };
  }, [candles, width, height]);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {priceLines.map((line, i) => (
        <g key={i}>
          <line
            x1={0} y1={line.y} x2={width} y2={line.y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x={4} y={line.y - 3} fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="JetBrains Mono">
            {line.price}
          </text>
        </g>
      ))}

      {normalizedCandles.map((c, i) => {
        const color = c.isGreen ? "#00ff88" : "#ff3366";
        const bodyTop = Math.min(c.openY, c.closeY);
        const bodyH = Math.max(Math.abs(c.closeY - c.openY), 1);
        return (
          <g key={i} style={{ animationDelay: `${i * 0.03}s` }}>
            <line
              x1={c.x} y1={c.highY} x2={c.x} y2={c.lowY}
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.7"
            />
            <rect
              x={c.x - c.w / 2}
              y={bodyTop}
              width={c.w}
              height={bodyH}
              fill={c.isGreen ? "rgba(0,255,136,0.25)" : "rgba(255,51,102,0.25)"}
              stroke={color}
              strokeWidth="1"
              rx="1"
              className="bar-animate"
              style={{ animationDelay: `${i * 0.02}s`, filter: `drop-shadow(0 0 2px ${color}40)` }}
            />
          </g>
        );
      })}
    </svg>
  );
}
