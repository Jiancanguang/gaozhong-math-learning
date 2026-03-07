'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type DualAxisChartProps = {
  labels: string[];
  entryScores: (number | null)[];
  exitRates: (number | null)[];
  tooltipLabels?: string[];
};

export function DualAxisChart({ labels, entryScores, exitRates, tooltipLabels }: DualAxisChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: '进门考',
        data: entryScores,
        borderColor: '#6c5ce7',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#6c5ce7',
        yAxisID: 'y'
      },
      {
        label: '课后测试得分率(%)',
        data: exitRates,
        borderColor: '#00b894',
        backgroundColor: 'rgba(0, 184, 148, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#00b894',
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, color: '#9f96ab', font: { size: 11 } },
        position: 'left' as const,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      y1: {
        min: 0,
        max: 100,
        ticks: {
          callback: (v: string | number) => `${v}%`,
          color: '#9f96ab',
          font: { size: 11 }
        },
        position: 'right' as const,
        grid: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9f96ab', font: { size: 11 } }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { usePointStyle: true, padding: 16, font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          title: (ctx: Array<{ dataIndex: number }>) => {
            if (tooltipLabels && ctx[0]) return tooltipLabels[ctx[0].dataIndex];
            return undefined;
          }
        }
      }
    }
  };

  return (
    <div className="rounded-xl border border-border-light bg-surface-alt p-3" style={{ height: 280 }}>
      <Line data={data} options={options} />
    </div>
  );
}
