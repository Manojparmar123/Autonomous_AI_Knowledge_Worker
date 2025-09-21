"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

type Props = {
  barData?: any[];
  lineData?: any[];
  pieData?: any[];
};

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

export default function ChartCard({ barData = [], lineData = [], pieData = [] }: Props) {
  const fallbackBar = barData.length ? barData : [
    { name: "Mon", value: 4 },
    { name: "Tue", value: 8 },
    { name: "Wed", value: 6 },
    { name: "Thu", value: 10 },
    { name: "Fri", value: 7 },
  ];
  const fallbackLine = lineData.length ? lineData : [
    { name: "Day 1", value: 2 },
    { name: "Day 2", value: 5 },
    { name: "Day 3", value: 8 },
    { name: "Day 4", value: 6 },
  ];
  const fallbackPie = pieData.length ? pieData : [
    { name: "Completed", value: 80 },
    { name: "Failed", value: 15 },
    { name: "Running", value: 5 },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Daily Tasks</h4>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fallbackBar}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-1 bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Trends</h4>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fallbackLine}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-1 bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Status</h4>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={fallbackPie} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} label>
                {fallbackPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
