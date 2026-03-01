'use client';

import { useState } from 'react';

import type { StudentTrendPoint } from '@/lib/score-tracker';

type TrendChartProps = {
  points: StudentTrendPoint[];
};

type MetricPoint = {
  examId: string;
  examName: string;
  examDate: string;
  value: number;
};

type SeriesConfig = {
  label: string;
  color: string;
  points: MetricPoint[];
};

type SingleChartProps = {
  title: string;
  emptyText: string;
  series: SeriesConfig[];
  formatter: (value: number) => string;
  invert?: boolean;
  fixedMin?: number;
  fixedMax?: number;
};

function buildGridValues(minValue: number, maxValue: number) {
  if (minValue === maxValue) {
    return [maxValue, maxValue, minValue];
  }

  return [maxValue, maxValue - (maxValue - minValue) / 2, minValue];
}

function SingleTrendChart({ title, emptyText, series, formatter, invert = false, fixedMin, fixedMax }: SingleChartProps) {
  const activeSeries = series.filter((item) => item.points.length > 0);

  if (activeSeries.length === 0) {
    return <p className="rounded-2xl border border-dashed border-tide/20 p-10 text-sm text-ink/60">{emptyText}</p>;
  }

  const width = 920;
  const height = 340;
  const paddingX = 48;
  const paddingTop = 28;
  const paddingBottom = 56;
  const values = activeSeries.flatMap((item) => item.points.map((point) => point.value));
  const computedMin = fixedMin ?? Math.min(...values);
  const computedMax = fixedMax ?? Math.max(...values);
  const minValue = computedMin;
  const maxValue = computedMax;
  const range = Math.max(maxValue - minValue, fixedMin !== undefined || fixedMax !== undefined ? 1 : 10);
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;
  const gridValues = buildGridValues(minValue, maxValue);

  const chartSeries = activeSeries.map((item) => {
    const chartPoints = item.points.map((point, index) => {
      const x = item.points.length === 1 ? width / 2 : paddingX + (innerWidth * index) / (item.points.length - 1);
      const normalized = invert ? (point.value - minValue) / range : (maxValue - point.value) / range;
      const y = paddingTop + normalized * innerHeight;

      return {
        ...point,
        x,
        y
      };
    });

    return {
      ...item,
      chartPoints,
      polyline: chartPoints.map((point) => `${point.x},${point.y}`).join(' ')
    };
  });

  const axisLabels = activeSeries[0]?.points ?? [];

  return (
    <article className="rounded-2xl border border-tide/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-tide">{title}</h3>
        {chartSeries.length > 1 ? (
          <div className="flex flex-wrap gap-3 text-xs text-ink/70">
            {chartSeries.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        {gridValues.map((value, index) => {
          const y = paddingTop + (innerHeight * index) / Math.max(gridValues.length - 1, 1);
          return (
            <g key={`${title}-${value}-${index}`}>
              <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="rgba(13,59,102,0.12)" strokeDasharray="4 4" />
              <text x={paddingX - 8} y={y + 4} textAnchor="end" fontSize="12" fill="rgba(15,23,42,0.6)">
                {formatter(value)}
              </text>
            </g>
          );
        })}

        {chartSeries.map((item) => (
          <g key={item.label}>
            <polyline fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={item.polyline} />
            {item.chartPoints.map((point) => (
              <g key={`${item.label}-${point.examId}`}>
                <circle cx={point.x} cy={point.y} r="5" fill={item.color} stroke="#ffffff" strokeWidth="2" />
                <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize="12" fill="#0b253a">
                  {formatter(point.value)}
                </text>
              </g>
            ))}
          </g>
        ))}

        {axisLabels.map((point, index) => {
          const x = axisLabels.length === 1 ? width / 2 : paddingX + (innerWidth * index) / (axisLabels.length - 1);
          return (
            <g key={`${title}-axis-${point.examId}`}>
              <text x={x} y={height - 24} textAnchor="middle" fontSize="11" fill="rgba(15,23,42,0.7)">
                {point.examDate}
              </text>
              <text x={x} y={height - 10} textAnchor="middle" fontSize="11" fill="rgba(15,23,42,0.6)">
                {point.examName.length > 8 ? `${point.examName.slice(0, 8)}…` : point.examName}
              </text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}

export function TrendChart({ points }: TrendChartProps) {
  if (points.length === 0) {
    return <p className="rounded-xl border border-dashed border-tide/20 p-6 text-sm text-ink/60">还没有考试记录，暂时无法生成趋势图。</p>;
  }

  const [activeView, setActiveView] = useState<'score' | 'rank' | 'rate'>('score');

  const scorePoints = points.map((point) => ({
    examId: point.examId,
    examName: point.examName,
    examDate: point.examDate,
    value: point.totalScore
  }));
  const scoreRatePoints = points.flatMap((point) =>
    point.scoreRate === null
      ? []
      : [
          {
            examId: point.examId,
            examName: point.examName,
            examDate: point.examDate,
            value: point.scoreRate
          }
        ]
  );
  const classRankPoints = points.flatMap((point) =>
    point.classRank === null
      ? []
      : [
          {
            examId: point.examId,
            examName: point.examName,
            examDate: point.examDate,
            value: point.classRank
          }
        ]
  );
  const gradeRankPoints = points.flatMap((point) =>
    point.gradeRank === null
      ? []
      : [
          {
            examId: point.examId,
            examName: point.examName,
            examDate: point.examDate,
            value: point.gradeRank
          }
        ]
  );

  const scoreChart = (
    <SingleTrendChart
      title="分数趋势"
      emptyText="还没有可展示的分数记录。"
      series={[
        {
          label: '总分',
          color: '#0f6d8c',
          points: scorePoints
        }
      ]}
      formatter={(value) => value.toFixed(0)}
    />
  );

  const rankChart = (
    <SingleTrendChart
      title="排名趋势"
      emptyText="还没有填写班排或年排，暂时无法生成排名趋势。"
      series={[
        {
          label: '班排',
          color: '#0f6d8c',
          points: classRankPoints
        },
        {
          label: '年排',
          color: '#f08a24',
          points: gradeRankPoints
        }
      ]}
      formatter={(value) => `${value.toFixed(0)}名`}
      invert
    />
  );

  const rateChart = (
    <SingleTrendChart
      title="得分率趋势"
      emptyText="还没有填写总分满分，暂时无法计算得分率。"
      series={[
        {
          label: '得分率',
          color: '#0f6d8c',
          points: scoreRatePoints
        }
      ]}
      formatter={(value) => `${value.toFixed(1)}%`}
      fixedMin={0}
      fixedMax={100}
    />
  );

  const views: Array<{
    key: 'score' | 'rank' | 'rate';
    label: string;
    description: string;
    content: JSX.Element;
  }> = [
    {
      key: 'score',
      label: '分数',
      description: '查看总分变化，适合直接观察分数波动。',
      content: scoreChart
    },
    {
      key: 'rank',
      label: '排名',
      description: '查看班排和年排变化，名次越小位置越高。',
      content: rankChart
    },
    {
      key: 'rate',
      label: '得分率',
      description: '按总分满分换算百分比，更适合跨考试对比。',
      content: rateChart
    }
  ];

  const activeViewConfig = views.find((item) => item.key === activeView) ?? views[0];

  return (
    <div className="space-y-5">
      {activeViewConfig.content}

      <div className="grid gap-3 md:grid-cols-3">
        {views.map((item) => {
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveView(item.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-tide bg-tide text-white shadow-card'
                  : 'border border-tide/15 bg-white text-tide hover:border-tide/35 hover:bg-tide/5'
              }`}
            >
              <span className="block text-lg font-semibold">{item.label}</span>
              <span className={`mt-2 block text-sm ${active ? 'text-white/85' : 'text-ink/70'}`}>{item.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
