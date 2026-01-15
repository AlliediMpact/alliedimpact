'use client';

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

/**
 * AdminCharts Component
 * 
 * Provides 4 key charts for admin dashboard:
 * 1. Revenue Over Time (Line Chart)
 * 2. User Registrations (Bar Chart)
 * 3. Journey Completion Rate (Pie Chart)
 * 4. Top Schools Leaderboard (Table)
 */

interface RevenueData {
  date: string;
  revenue: number;
  commissions: number;
}

interface RegistrationData {
  month: string;
  users: number;
}

interface CompletionData {
  name: string;
  value: number;
  color: string;
}

interface SchoolData {
  id: string;
  name: string;
  leads: number;
  conversions: number;
  revenue: number;
  commissionPending: number;
}

interface AdminChartsProps {
  revenueData: RevenueData[];
  registrationData: RegistrationData[];
  completionData: CompletionData[];
  topSchools: SchoolData[];
}

export function AdminCharts({
  revenueData,
  registrationData,
  completionData,
  topSchools,
}: AdminChartsProps) {
  return (
    <div className="space-y-6">
      {/* Revenue Over Time */}
      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Revenue Over Time</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Track total revenue and commission payouts over the last 12 months
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `R${value.toFixed(2)}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              name="Total Revenue"
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="commissions"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Commissions Paid"
              dot={{ fill: '#f59e0b', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Registrations */}
      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <h3 className="text-xl font-bold mb-4 dark:text-white">User Registrations</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Monthly new user sign-ups showing growth trends
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={registrationData}>
            <CartesianGrid strokeDasharray="3 3" />
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
            <Bar dataKey="users" fill="#3b82f6" name="New Users" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Journey Completion Rate */}
      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Journey Completion Rate</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Percentage of journeys completed vs abandoned
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={completionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {completionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4">
          {completionData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Schools Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Top Schools Leaderboard</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Top performing driving schools by lead generation and conversions
        </p>
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
                  Leads
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Conversions
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody>
              {topSchools.map((school, index) => (
                <tr
                  key={school.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <span className="text-xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {school.name}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                    {school.leads}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-gray-700 dark:text-gray-300">{school.conversions}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({school.leads > 0 ? ((school.conversions / school.leads) * 100).toFixed(0) : 0}%)
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                    R{school.revenue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-orange-600 dark:text-orange-400">
                    R{school.commissionPending.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {topSchools.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No school data available yet
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to generate mock data for testing
 * Remove this in production and use real data from Firestore
 */
export function generateMockChartData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData: RevenueData[] = months.map((month, index) => ({
    date: month,
    revenue: Math.random() * 10000 + 5000,
    commissions: Math.random() * 2000 + 500,
  }));

  const registrationData: RegistrationData[] = months.map((month) => ({
    month,
    users: Math.floor(Math.random() * 500 + 100),
  }));

  const completionData: CompletionData[] = [
    { name: 'Completed', value: 68, color: '#10b981' },
    { name: 'Abandoned', value: 32, color: '#ef4444' },
  ];

  const topSchools: SchoolData[] = [
    {
      id: '1',
      name: 'Cape Town Driving Academy',
      leads: 245,
      conversions: 189,
      revenue: 18900,
      commissionPending: 1890,
    },
    {
      id: '2',
      name: 'Johannesburg Driving School',
      leads: 198,
      conversions: 145,
      revenue: 14500,
      commissionPending: 1450,
    },
    {
      id: '3',
      name: 'Durban Learner Academy',
      leads: 176,
      conversions: 132,
      revenue: 13200,
      commissionPending: 1320,
    },
    {
      id: '4',
      name: 'Pretoria K53 Masters',
      leads: 154,
      conversions: 98,
      revenue: 9800,
      commissionPending: 980,
    },
    {
      id: '5',
      name: 'Port Elizabeth Driving',
      leads: 142,
      conversions: 87,
      revenue: 8700,
      commissionPending: 870,
    },
  ];

  return {
    revenueData,
    registrationData,
    completionData,
    topSchools,
  };
}
