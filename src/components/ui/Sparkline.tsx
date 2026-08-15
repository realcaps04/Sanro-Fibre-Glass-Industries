interface SparklineProps {
  data: Array<{ label: string; value: number }>;
}

export function Sparkline({ data }: SparklineProps) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const width = 120;
  const height = 40;
  const barWidth = width / Math.max(data.length, 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full text-primary" aria-hidden>
      {data.map((item, index) => {
        const barHeight = Math.max(2, (item.value / max) * (height - 2));
        return (
          <rect
            key={`${item.label}-${index}`}
            x={index * barWidth + 1}
            y={height - barHeight}
            width={Math.max(barWidth - 2, 1)}
            height={barHeight}
            rx="1"
            fill="currentColor"
            opacity={item.value === 0 ? 0.18 : 0.85}
          />
        );
      })}
    </svg>
  );
}
