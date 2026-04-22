import { useMemo } from "react";

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showArea?: boolean;
}

export default function MiniChart({ data, color = "#00ff88", height = 48, width = 120, showArea = true }: MiniChartProps) {
  const points = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    return data.map((v, i) => ({
      x: i * step,
      y: height - ((v - min) / range) * height,
    }));
  }, [data, height, width]);

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${points[0].x},${height} ` +
    points.map(p => `L${p.x},${p.y}`).join(" ") +
    ` L${points[points.length - 1].x},${height} Z`;

  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color === "auto" ? (isPositive ? "#00ff88" : "#ff3366") : color;
  const areaColor = lineColor === "#00ff88" ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.08)";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      {showArea && (
        <path d={areaPath} fill={areaColor} />
      )}
      <polyline
        points={polyline}
        stroke={lineColor}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mini-chart-line"
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={lineColor}
        style={{ filter: `drop-shadow(0 0 4px ${lineColor})` }}
      />
    </svg>
  );
}
