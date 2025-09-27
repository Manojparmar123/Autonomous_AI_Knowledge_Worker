'use client';

import InsightsChart from '../../src/components/InsightsChart';

// Dummy data for testing – replace with real API data
const sampleData = [
  { date: '2025-01-01', value: 10 },
  { date: '2025-01-02', value: 20 },
  { date: '2025-01-03', value: 15 },
  { date: '2025-01-04', value: 30 },
];

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <InsightsChart data={sampleData} lines={[]} />
    </div>
  );
}
