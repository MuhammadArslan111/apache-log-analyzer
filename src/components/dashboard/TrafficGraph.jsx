// Import necessary dependencies for charting and date handling
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, isWithinInterval } from 'date-fns';
import { FiClock, FiCalendar, FiTrendingUp, FiActivity } from 'react-icons/fi';

// Define time range options for filtering data
const TIME_RANGES = [
  { id: 'last1h', label: 'Last Hour', icon: FiClock },
  { id: 'last24h', label: 'Last 24 Hours', icon: FiClock },
  { id: 'last7d', label: 'Last 7 Days', icon: FiCalendar },
  { id: 'all', label: 'All Time', icon: FiActivity }
];

// Define view types for switching between traffic and error analytics
const VIEW_TYPES = [
  { id: 'traffic', label: 'Traffic', icon: FiTrendingUp },
  { id: 'errors', label: 'Errors', icon: FiActivity }
];

const TrafficGraph = ({ logData }) => {
  // State for managing time range and view type filters
  const [timeRange, setTimeRange] = useState('all');
  const [viewType, setViewType] = useState('traffic');

    // Adding... Helper function to determine the time range filter based on selected option
  const getTimeRangeFilter = () => {
    if (!logData.length) return null;

    // Sort logs by timestamp to get min and max dates
    const timestamps = logData.map(log => new Date(log.timestamp));
    const maxDate = new Date(Math.max(...timestamps));
    const minDate = new Date(Math.min(...timestamps));

    switch (timeRange) {
      case 'last1h':
        const hourBefore = new Date(maxDate);
        hourBefore.setHours(maxDate.getHours() - 1);
        return { start: hourBefore, end: maxDate };
      
      case 'last24h':
        const dayBefore = new Date(maxDate);
        dayBefore.setDate(maxDate.getDate() - 1);
        return { start: dayBefore, end: maxDate };
      
      case 'last7d':
        const weekBefore = new Date(maxDate);
        weekBefore.setDate(maxDate.getDate() - 7);
        return { start: weekBefore, end: maxDate };
      
      case 'all':
      default:
        return { start: minDate, end: maxDate };
    }
  };

  // Adding... Helper function to format time display based on selected time range
  const getTimeFormatter = () => {
    switch (timeRange) {
      case 'last1h':
        return (time) => format(new Date(time), 'HH:mm');
      case 'last24h':
        return (time) => format(new Date(time), 'HH:mm');
      case 'last7d':
        return (time) => format(new Date(time), 'MMM dd HH:mm');
      case 'all':
        return (time) => format(new Date(time), 'MMM dd yyyy');
      default:
        return (time) => format(new Date(time), 'MMM dd HH:mm');
    }
  };

  // Adding... Helper function to determine data grouping interval based on time range
  const getInterval = () => {
    switch (timeRange) {
      case 'last1h':
        return 5; // 5 minutes
      case 'last24h':
        return 30; // 30 minutes
      case 'last7d':
        return 180; // 3 hours
      case 'all':
        return 1440; // 1 day
      default:
        return 60; // 1 hour
    }
  };

  // Adding... Core data processing function that transforms raw log data into chart-ready format
  const processData = () => {
    // Adding... Initialize storage for processed time series data
    const timeData = {};
    const filter = getTimeRangeFilter();
    if (!filter) return [];
    
    // Adding... Filter and sort logs based on selected time range
    const filteredLogs = logData
      .filter(log => {
        const timestamp = new Date(log.timestamp);
        return isWithinInterval(timestamp, filter);
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Adding... Group and aggregate data by time intervals
    filteredLogs.forEach(log => {
      const timestamp = new Date(log.timestamp);
      const interval = getInterval();
      const timeKey = new Date(timestamp).setMinutes(
        Math.floor(timestamp.getMinutes() / interval) * interval,
        0, 0
      );
      
      if (!timeData[timeKey]) {
        timeData[timeKey] = {
          time: new Date(timeKey),
          requests: 0,
          errors: 0,
          errorRate: 0,
          successRate: 0,
          avgResponseTime: 0,
          totalResponseTime: 0
        };
      }
      
      const point = timeData[timeKey];
      point.requests++;
      
      if (parseInt(log.statusCode) >= 400) {
        point.errors++;
      }

      if (log.responseTime) {
        point.totalResponseTime += parseFloat(log.responseTime);
      }
    });

    // Adding... Calculate final metrics for each time interval
    return Object.values(timeData).map(point => ({
      ...point,
      errorRate: ((point.errors / point.requests) * 100).toFixed(1),
      successRate: (((point.requests - point.errors) / point.requests) * 100).toFixed(1),
      avgResponseTime: (point.totalResponseTime / point.requests).toFixed(2)
    }));
  };

  const data = processData();

  // Adding... Custom tooltip component for enhanced chart interactivity
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        // Adding... Main container with responsive layout and styling
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          {/* Adding... Header section with title and control panels */}
          <p className="text-sm font-medium text-gray-800 mb-2">
            {format(new Date(label), 'MMM d, yyyy HH:mm')}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium">
                {entry.name.includes('Rate') 
                  ? `${entry.value}%`
                  : entry.name.includes('Time')
                    ? `${entry.value}ms`
                    : entry.value.toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    // Main container with graph controls and visualization
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Traffic Analysis
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Request volume and performance metrics
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            {TIME_RANGES.map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                  ${timeRange === range.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <range.icon className="w-4 h-4" />
                <span>{range.label}</span>
              </button>
            ))}
          </div>

          {/* View Type Selector */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            {VIEW_TYPES.map(view => (
              <button
                key={view.id}
                onClick={() => setViewType(view.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                  ${viewType === view.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <view.icon className="w-4 h-4" />
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Adding... Summary statistics grid showing key metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-semibold text-gray-800 mt-1">
            {data.reduce((sum, point) => sum + point.requests, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Error Rate</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">
            {(data.reduce((sum, point) => sum + parseFloat(point.errorRate), 0) / data.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">
            {(data.reduce((sum, point) => sum + parseFloat(point.successRate), 0) / data.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg Response Time</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">
            {(data.reduce((sum, point) => sum + parseFloat(point.avgResponseTime), 0) / data.length).toFixed(2)}ms
          </p>
        </div>
      </div>

      {/* Adding... Dynamic chart visualization section */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {/* Adding... Conditional rendering of either traffic or error analysis chart */}
          {viewType === 'traffic' ? (
            // Adding... Traffic analysis chart with requests and response time
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time"
                tickFormatter={getTimeFormatter()}
                stroke="#6B7280"
              />
              <YAxis 
                yAxisId="left"
                stroke="#6B7280"
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#2563EB"
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#3B82F6"
                fill="#93C5FD"
                fillOpacity={0.1}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgResponseTime"
                name="Response Time"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time"
                tickFormatter={getTimeFormatter()}
                stroke="#6B7280"
              />
              <YAxis 
                stroke="#6B7280"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="errorRate"
                name="Error Rate"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="successRate"
                name="Success Rate"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
              // Adding... Error analysis chart with error and success rates
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Adding... Export the TrafficGraph component for use in other parts of the application
export default TrafficGraph; 