import { Card, Metric, Text, BadgeDelta } from '@tremor/react';

export type DeltaType = 'increase' | 'decrease' | 'unchanged' | 'moderateIncrease' | 'moderateDecrease';

interface MetricCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaType?: DeltaType;
}

export function MetricCard({ title, value, delta, deltaType = 'unchanged' }: MetricCardProps) {
  return (
    <Card className="max-w-xs">
      <Text>{title}</Text>
      <Metric>{value}</Metric>
      {delta && <BadgeDelta deltaType={deltaType}>{delta}</BadgeDelta>}
    </Card>
  );
}
