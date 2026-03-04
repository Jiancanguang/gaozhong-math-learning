import type { StudentLessonRecord } from '@/lib/growth-tracker';

type Props = {
  records: StudentLessonRecord[];
};

const W = 700;
const H = 260;
const PAD = { top: 30, right: 20, bottom: 50, left: 40 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

export function ScoreTrendChart({ records }: Props) {
  if (records.length < 2) {
    return <p className="text-sm text-ink/50">需要至少2次课堂记录才能显示趋势图</p>;
  }

  const points = records.map((r, i) => ({
    index: i,
    entry: r.entryScore,
    exit: r.exitScore,
    date: r.lesson.date,
    topic: r.lesson.topic
  }));

  const n = points.length;
  const xStep = n > 1 ? CHART_W / (n - 1) : CHART_W;
  const yMin = 0;
  const yMax = 10;
  const yRange = yMax - yMin;

  function toX(i: number) {
    return PAD.left + i * xStep;
  }
  function toY(v: number) {
    return PAD.top + CHART_H - ((v - yMin) / yRange) * CHART_H;
  }

  // Grid lines
  const gridLines = [0, 2, 4, 6, 8, 10];

  // Polyline paths
  const entryPath = points
    .filter((p) => p.entry != null)
    .map((p) => `${toX(p.index)},${toY(p.entry!)}`)
    .join(' ');
  const exitPath = points
    .filter((p) => p.exit != null)
    .map((p) => `${toX(p.index)},${toY(p.exit!)}`)
    .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        {/* Grid */}
        {gridLines.map((v) => (
          <g key={v}>
            <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
          </g>
        ))}

        {/* Entry line (blue) */}
        {entryPath ? <polyline points={entryPath} fill="none" stroke="#4a90d9" strokeWidth="2" /> : null}
        {points.filter((p) => p.entry != null).map((p) => (
          <circle key={`e-${p.index}`} cx={toX(p.index)} cy={toY(p.entry!)} r="4" fill="#4a90d9" />
        ))}

        {/* Exit line (green) */}
        {exitPath ? <polyline points={exitPath} fill="none" stroke="#1d7a4c" strokeWidth="2" /> : null}
        {points.filter((p) => p.exit != null).map((p) => (
          <circle key={`x-${p.index}`} cx={toX(p.index)} cy={toY(p.exit!)} r="4" fill="#1d7a4c" />
        ))}

        {/* X-axis labels */}
        {points.map((p) => (
          <text key={`d-${p.index}`} x={toX(p.index)} y={H - PAD.bottom + 16} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {p.date.slice(5)}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-ink/60">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-sm" style={{ backgroundColor: '#4a90d9' }} /> 进门考
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-sm" style={{ backgroundColor: '#1d7a4c' }} /> 出门考
        </span>
      </div>
    </div>
  );
}
