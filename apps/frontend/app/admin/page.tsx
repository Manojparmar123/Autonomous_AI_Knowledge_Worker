'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

interface InsightsChartProps {
  data: ChartDataPoint[];
  lines?: { key: string; color: string; name?: string }[];
  title?: string;
}

export default function InsightsChart({
  data,
  lines = [{ key: 'value', color: '#4f46e5', name: 'Value' }],
  title = 'Insights Overview',
}: InsightsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-md text-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value) => [value, '']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name || line.key}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
