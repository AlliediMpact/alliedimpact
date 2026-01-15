'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Award, DollarSign } from 'lucide-react';

/**
 * AdminDashboardCharts Component
 * 
 * Data visualization for admin dashboard:
 * 1. Revenue over time (line chart)
 * 2. User registrations (bar chart)
 * 3. Journey completion rate (pie chart)
 * 4. Top schools leaderboard (table)
 */

interface ChartData {
  revenue: { date: string; amount: number }[];
  registrations: { month: string; count: number }[];
  completionRate: { name: string; value: number }[];
  topSchools: { name: string; students: number; revenue: number }[];
}

export function AdminDashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      // In production, fetch from Firestore aggregations or Cloud Functions
      // For now, using mock data structure
      const mockData: ChartData = {
        revenue: generateRevenueData(timeRange),
        registrations: generateRegistrationsData(timeRange),
        completionRate: [
          { name: 'Completed', value: 65 },
          { name: 'In Progress', value: 25 },
          { name: 'Abandoned', value: 10 },
        ],
        topSchools: [
          { name: 'Drive Academy Cape Town', students: 245, revenue: 24250 },
          { name: 'Safe Drivers JHB', students: 198, revenue: 19800 },
          { name: 'Pro Driving School PE', students: 167, revenue: 16700 },
          { name: 'City Driving Durban', students: 134, revenue: 13400 },
          { name: 'Coastal Drivers', students: 89, revenue: 8900 },
        ],
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        Failed to load chart data
      </div>
    );
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
        {(['7d', '30d', '90d', '1y'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : range === '90d' ? 'Last 90 days' : 'Last year'}
          </button>
        ))}
      </div>

      {/* Revenue Over Time */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Over Time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: R{data.revenue.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue (R)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Registrations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Registrations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {data.registrations.reduce((sum, d) => sum + d.count, 0).toLocaleString()} users
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.registrations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="New Users" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Journey Completion Rate */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Journey Completion Rate</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.completionRate[0].value}% of journeys are completed successfully
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.completionRate}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.completionRate.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Schools Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Driving Schools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Schools ranked by student count and revenue
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  School Name
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Students
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topSchools.map((school, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : index === 1
                          ? 'bg-gray-100 text-gray-800'
                          : index === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                    {school.name}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                    {school.students.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                    R{school.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper functions to generate mock data
function generateRevenueData(range: string) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' }),
      amount: Math.floor(Math.random() * 5000) + 1000,
    });
  }
  return data;
}

function generateRegistrationsData(range: string) {
  const months = range === '7d' || range === '30d' ? 6 : range === '90d' ? 3 : 12;
  const data = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    data.push({
      month: date.toLocaleDateString('en-ZA', { month: 'short' }),
      count: Math.floor(Math.random() * 500) + 100,
    });
  }
  return data;
}
