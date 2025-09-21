'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface LineConfig {
  key: string;
  color: string;
  name: string;
}

interface InsightsChartProps {
  data: any[];
  lines: LineConfig[];
  title?: string;
}

export default function InsightsChart({ data, lines, title }: InsightsChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {data.length === 0 ? (
        <p className="text-gray-500 text-center">No insights available</p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '0.5rem', borderColor: '#e5e7eb' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                name={line.name}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
