import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparklineChart({ data, color = '#3B82F6', height = 30 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={true} animationDuration={600} animationEasing="ease-out" />
      </LineChart>
    </ResponsiveContainer>
  );
}
