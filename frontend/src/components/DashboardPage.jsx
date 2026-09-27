import React, { useEffect, useState } from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import StatCard from '../components/StatCard';
import AnalyticsPanel from '../components/AnalyticsPanel';

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/analytics/provider-stats'),
        fetch('/api/analytics/recent-logs'),
      ]);

      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (logsData.success) {
        setLogs(logsData.data);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }

  const totalRequests = stats.reduce(
    (sum, item) => sum + Number(item.total_requests || 0),
    0
  );

  const totalTokens = stats.reduce(
    (sum, item) =>
      sum +
      Number(item.total_prompt_tokens || 0) +
      Number(item.total_completion_tokens || 0),
    0
  );

  const successfulRequests = stats.reduce(
    (sum, item) => sum + Number(item.success_count || 0),
    0
  );

  const avgLatency = totalRequests
    ? Math.round(
        stats.reduce(
          (sum, item) =>
            sum +
            Number(item.avg_latency_ms || 0) *
              Number(item.total_requests || 0),
          0
        ) / totalRequests
      )
    : 0;

  const successRate = totalRequests
    ? Math.round(
        (successfulRequests / totalRequests) * 100
      )
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center text-sm text-gray-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-11/12 px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Analytics
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          LLM usage and performance
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={totalRequests}
        />

        <StatCard
          label="Average Latency"
          value={`${avgLatency} ms`}
        />

        <StatCard
          label="Total Tokens"
          value={totalTokens.toLocaleString()}
        />

        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AnalyticsPanel title="Average Latency by Provider">
          {stats.length === 0 ? (
            <p className="text-sm text-gray-500">
              No data yet.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={stats}>
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="avg_latency_ms"
                    name="Latency"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsPanel>

        <AnalyticsPanel title="Token Usage by Provider">
          {stats.length === 0 ? (
            <p className="text-sm text-gray-500">
              No data yet.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={stats}>
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />

                  <Bar
                    dataKey="total_prompt_tokens"
                    name="Input"
                  />

                  <Bar
                    dataKey="total_completion_tokens"
                    name="Output"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel title="Recent Requests">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">
            No requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-3 py-3 font-medium">
                    Provider
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Model
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Input
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Output
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Latency
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-3 py-3 text-gray-700">
                      {log.provider}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {log.model}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {log.prompt_tokens}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {log.completion_tokens}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {log.latency_ms} ms
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnalyticsPanel>
    </div>
  );
}