'use client';
import { useEffect, useState } from 'react';

export default function Insights() {
  const [insights, setInsights] = useState<any[]>([]);
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + '/insights' : 'http://localhost:8000/insights')
      .then(r => r.json()).then(setInsights).catch(() => setInsights([]));
  }, []);
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Insights</h1>
      <div className="grid gap-3">
        {insights.map((i:any) => (
          <div key={i.id} className="bg-white rounded-2xl p-4 shadow">
            <div className="text-xs uppercase">{i.type}</div>
            <div className="text-lg font-semibold">{i.text}</div>
            <div className="text-xs opacity-70">Confidence: {Math.round((i.confidence||0)*100)}%</div>
          </div>
        ))}
        {insights.length===0 && <div>No insights yet. Trigger ingestion from API.</div>}
      </div>
    </main>
  );
}
