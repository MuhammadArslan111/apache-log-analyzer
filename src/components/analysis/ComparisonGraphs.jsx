import React, { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { FiTrendingUp, FiActivity, FiBarChart2, FiPieChart, FiGlobe } from 'react-icons/fi';

// Main component for displaying various comparison graphs of log data
const ComparisonGraphs = ({ data }) => {
  // Using useMemo to optimize performance by preventing unnecessary recalculations
  const graphData = useMemo(() => {
    // Processing time-based traffic data
    // Grouping logs by date-hour combination and calculating metrics
    const timeData = data.reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours();
      const date = format(new Date(log.timestamp), 'MM/dd');
      const key = `${date}-${hour}`;
      
      // Initialize accumulator object for new time entries
      if (!acc[key]) {
        acc[key] = {
          timestamp: new Date(log.timestamp),
          requests: 0,
          errors: 0,
          avgResponseTime: 0,
          totalResponseTime: 0
        };
      }
      
      // Update metrics for each log entry
      acc[key].requests++;
      if (parseInt(log.statusCode) >= 400) acc[key].errors++;
      acc[key].totalResponseTime += log.bytes || 0;
      acc[key].avgResponseTime = acc[key].totalResponseTime / acc[key].requests;
      
      return acc;
    }, {});

    // Analyzing HTTP method distribution over time
    // Grouping requests by date and HTTP method
    const methodData = data.reduce((acc, log) => {
      const date = format(new Date(log.timestamp), 'MM/dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          GET: 0,
          POST: 0,
          PUT: 0,
          DELETE: 0
        };
      }
      acc[date][log.method] = (acc[date][log.method] || 0) + 1;
      return acc;
    }, {});

    // Calculating top 10 most active IP addresses
    const ipData = data.reduce((acc, log) => {
      acc[log.ip] = (acc[log.ip] || 0) + 1;
      return acc;
    }, {});

    // Sort and slice to get top 10 IPs by request count
    const top10IPs = Object.entries(ipData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({
        ip,
        requests: count
      }));

    // Preparing final data structure for graphs
    return {
      timeData: Object.values(timeData)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(item => ({
          ...item,
          errorRate: (item.errors / item.requests) * 100,
          time: format(item.timestamp, 'MM/dd HH:mm')
        })),
      methodData: Object.values(methodData),
      top10IPs
    };
  }, [data]);

  // Reusable card component for wrapping individual graphs
  const GraphCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <Icon className="w-5 h-5 text-blue-500" />
          <span>{title}</span>
        </h3>
      </div>
      <div className="h-[300px]">
        {children}
      </div>
    </div>
  );

  // Main render section with grid layout for all graphs
  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-lg font-semibold text-gray-800">Comparison Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic vs Error Rate Line Chart */}
        <GraphCard title="Traffic vs Error Rate" icon={FiTrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData.timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis yAxisId="left" stroke="#6B7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#EF4444" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="errorRate"
                name="Error Rate (%)"
                stroke="#EF4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Response Time Analysis Area Chart */}
        <GraphCard title="Response Time Trends" icon={FiActivity}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData.timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="avgResponseTime"
                name="Avg Response Time"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* HTTP Methods Distribution Stacked Bar Chart */}
        <GraphCard title="HTTP Methods Over Time" icon={FiBarChart2}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData.methodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="GET" stackId="methods" fill="#3B82F6" />
              <Bar dataKey="POST" stackId="methods" fill="#10B981" />
              <Bar dataKey="PUT" stackId="methods" fill="#F59E0B" />
              <Bar dataKey="DELETE" stackId="methods" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Status Code Distribution Area Chart */}
        <GraphCard title="Status Code Distribution" icon={FiPieChart}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData.timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="requests"
                name="Total Requests"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="errors"
                name="Errors"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GraphCard>

        {/* Top 10 IP Addresses Horizontal Bar Chart */}
        <GraphCard title="Top 10 IP Addresses" icon={FiGlobe}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={graphData.top10IPs}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis
                dataKey="ip"
                type="category"
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="requests"
                name="Request Count"
                fill="#6366F1"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default ComparisonGraphs;