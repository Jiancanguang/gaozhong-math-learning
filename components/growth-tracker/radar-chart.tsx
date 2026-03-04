'use client';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type Props = {
  computeAbility: number;
  logicThinking: number;
  analysisSkill: number;
  knowledge: number;
};

export function RadarChart({ computeAbility, logicThinking, analysisSkill, knowledge }: Props) {
  const data = {
    labels: ['计算能力', '逻辑思维', '审题分析', '知识掌握'],
    datasets: [
      {
        data: [computeAbility, logicThinking, analysisSkill, knowledge],
        backgroundColor: 'rgba(26, 54, 93, 0.15)',
        borderColor: '#1a365d',
        borderWidth: 2,
        pointBackgroundColor: '#1a365d',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          font: { size: 11 },
          backdropColor: 'transparent'
        },
        pointLabels: {
          font: { size: 13, family: "'Noto Sans SC', sans-serif" },
          color: '#0f172a'
        },
        grid: {
          color: 'rgba(26, 54, 93, 0.1)'
        },
        angleLines: {
          color: 'rgba(26, 54, 93, 0.1)'
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Radar data={data} options={options} />
    </div>
  );
}
