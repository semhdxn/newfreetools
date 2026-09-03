import { MwmCriteria } from '@/data/mwmCriteriaData';
import { MwmResponse } from '@/lib/mwm/localStorage';
import { criteriaScoresFromResponse } from '@/lib/mwm/scoring';

interface MwmTrendChartProps {
  criteria: MwmCriteria[];
  responses: MwmResponse[];
}

export default function MwmTrendChart({ criteria, responses }: MwmTrendChartProps) {
  if (responses.length === 0) {
    return <p className="text-sm text-muted-foreground">No data to display</p>;
  }

  const sortedResponses = [...responses].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

  // Build data: for each criteria, get scores across all responses
  const dataByName: Record<string, (number | null)[]> = {};
  const dateLabels: string[] = [];

  sortedResponses.forEach((resp) => {
    const date = new Date(resp.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateLabels.push(date);

    const scores = criteriaScoresFromResponse(criteria, resp);
    scores.forEach((s) => {
      if (!dataByName[s.name]) {
        dataByName[s.name] = [];
      }
      dataByName[s.name].push(s.score);
    });
  });

  // Ensure all criteria have data for all dates (fill gaps with null)
  Object.keys(dataByName).forEach((name) => {
    while (dataByName[name].length < dateLabels.length) {
      dataByName[name].push(null);
    }
  });

  // Simple SVG chart
  const width = Math.max(600, dateLabels.length * 80);
  const height = 400;
  const padding = 50;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#6366f1', '#14b8a6', '#f97316',
  ];

  const xScale = chartWidth / (dateLabels.length - 1 || 1);
  const yScale = chartHeight / 5; // 1-5 scale

  return (
    <div className="border rounded-lg p-4 bg-white overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* Y-axis labels (1-5) */}
        {[1, 2, 3, 4, 5].map((y) => (
          <g key={`y-${y}`}>
            <line x1={padding - 5} y1={height - padding - y * yScale} x2={padding} y2={height - padding - y * yScale} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padding - 10} y={height - padding - y * yScale + 4} textAnchor="end" fontSize="12" fill="#6b7280">
              {y}
            </text>
          </g>
        ))}

        {/* Horizontal grid lines */}
        {[1, 2, 3, 4, 5].map((y) => (
          <line
            key={`grid-${y}`}
            x1={padding}
            y1={height - padding - y * yScale}
            x2={width - padding}
            y2={height - padding - y * yScale}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}

        {/* X-axis labels (dates) */}
        {dateLabels.map((label, i) => (
          <g key={`x-${i}`}>
            <line x1={padding + i * xScale} y1={height - padding} x2={padding + i * xScale} y2={height - padding + 5} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padding + i * xScale} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#6b7280">
              {label}
            </text>
          </g>
        ))}

        {/* Lines and points */}
        {Object.entries(dataByName).map(([name, scores], colorIdx) => {
          const color = colors[colorIdx % colors.length];
          const points: { x: number; y: number; score: number | null }[] = [];

          scores.forEach((score, i) => {
            if (score !== null) {
              points.push({
                x: padding + i * xScale,
                y: height - padding - score * yScale,
                score,
              });
            }
          });

          return (
            <g key={name}>
              {/* Line */}
              {points.length > 1 && (
                <polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />
              )}
              {/* Points */}
              {points.map((p, i) => (
                <circle key={`${name}-${i}`} cx={p.x} cy={p.y} r="4" fill={color} opacity="0.8" />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.keys(dataByName).map((name, idx) => (
          <div key={name} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="truncate">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
