'use client';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineChartProps {
  data: { date: string; views: number }[];
}

export function SparklineChart({ data }: SparklineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={64}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="views" fill="#38bdf8" radius={[2, 2, 0, 0]} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, fontSize: 11 }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#f1f5f9' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
