'use client';

import { DualAxisChart } from '@/components/growth-v2/ui/dual-axis-chart';

type Props = {
  labels: string[];
  entryScores: (number | null)[];
  exitRates: (number | null)[];
  tooltipLabels: string[];
};

export function ParentCharts({ labels, entryScores, exitRates, tooltipLabels }: Props) {
  return (
    <DualAxisChart
      labels={labels}
      entryScores={entryScores}
      exitRates={exitRates}
      tooltipLabels={tooltipLabels}
    />
  );
}
