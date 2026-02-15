'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Dummy data
const weeklyData = Array.from({ length: 7 }, (_, i) => ({
  label: `Day ${i + 1}`,
  score: Math.floor(Math.random() * 30) + 180,
  date: `2025-06-${10 + i}`,
}));

const monthlyData = [
  { label: 'Jan', score: 205, date: '2025-01' },
  { label: 'Feb', score: 198, date: '2025-02' },
  { label: 'Mar', score: 215, date: '2025-03' },
  { label: 'Apr', score: 187, date: '2025-04' },
  { label: 'May', score: 195, date: '2025-05' },
  { label: 'Jun', score: 210, date: '2025-06' },
];

const yearlyData = [
  { label: '2020', score: 160, date: '2020' },
  { label: '2021', score: 178, date: '2021' },
  { label: '2022', score: 190, date: '2022' },
  { label: '2023', score: 200, date: '2023' },
  { label: '2024', score: 215, date: '2024' },
  { label: '2025', score: 225, date: '2025' },
];

// Format date based on range
const formatDate = (date: string, range: string) => {
  if (range === 'yearly') return date;
  if (range === 'monthly') return date;
  if (range === 'weekly') {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return date;
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, range }: { active?: boolean; payload?: Array<{ payload: { score: number; date: string } }>; label?: string; range?: string }) => {
  if (active && payload?.length) {
    const { score, date } = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded-md border text-sm shadow">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-gray-600">Score: {score}</p>
        <p className="text-gray-500">Date: {formatDate(date, range || 'week')}</p>
      </div>
    );
  }
  return null;
};

const PerformanceTrends = () => {
  const [range, setRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const getData = () => {
    if (range === 'weekly') return weeklyData;
    if (range === 'yearly') return yearlyData;
    return monthlyData;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Performance Trends</h1>
        <select
          onChange={(e) => setRange(e.target.value as 'weekly' | 'monthly' | 'yearly')}
          value={range}
          className="border border-gray-300 rounded-md text-sm px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#8BC342]"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={getData()}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              domain={
                range === 'yearly' ? ['dataMin - 10', 'dataMax + 10'] : [150, 250]
              }
              width={40}
              tickMargin={10}
              padding={{ top: 10 }}
            />
            <Tooltip content={<CustomTooltip range={range} />} />
            <Bar
              dataKey="score"
              radius={[4, 4, 0, 0]}
              barSize={30}
              fill="#8BC342"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceTrends;
