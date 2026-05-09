'use client';

import { AreaChart, Card, Title } from '@tremor/react';

export interface TraceDataPoint {
  date: string;
  traces: number;
  errors: number;
}

interface TracesAreaChartProps {
  data: TraceDataPoint[];
  title?: string;
}

const valueFormatter = (n: number) => `${n.toLocaleString()} traces`;

export function TracesAreaChart({ data, title = 'Traces over time' }: TracesAreaChartProps) {
  return (
    <Card>
      <Title>{title}</Title>
      <AreaChart
        className="mt-4 h-48"
        data={data}
        index="date"
        categories={['traces', 'errors']}
        colors={['blue', 'red']}
        valueFormatter={valueFormatter}
        yAxisWidth={60}
      />
    </Card>
  );
}
