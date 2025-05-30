//Importing necessary React hooks and components
import React, { useMemo, useState } from 'react';
//Importing visualization components from recharts library
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
//Importing Feather icons for UI elements
import { 
  FiTrendingUp, FiActivity, 
  FiAlertTriangle, FiGlobe,
  FiChevronLeft, FiChevronRight, 
  FiChevronsLeft, FiChevronsRight, 
  FiSettings, FiSearch, FiX, FiDownload, FiUpload, FiEdit2, FiTrash2, FiEdit3, FiInfo, FiLink
} from 'react-icons/fi';
import TrafficGraph from './TrafficGraph';
import { parseUserAgent } from '../../utils/uaParser';
import axios from 'axios';
import { getCachedData, setCachedData } from '../../utils/cache';
import { format } from 'date-fns';

//  Base URL for country flag images
const FLAG_BASE_URL = 'https://flagcdn.com/w20';

// Function to fetch and cache country geolocation data
const fetchCountryData = async (ips) => {
  // Creating a unique cache key based on sorted IPs
  const cacheKey = 'country_data_' + JSON.stringify(ips.sort());
  
  // Try to get data from cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log('Using cached country data');
    return cachedData;
  }

  try {
    console.log('Fetching fresh country data');
    const response = await axios.post('http://localhost:5000/api/geo/batch', {
      ips: Array.from(new Set(ips)) // Remove duplicates
    });
    
    // Cache the response data
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching country data:', error);
    return [];
  }
};

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const HTTP_METHODS = {
  GET: { color: '#3B82F6', icon: FiDownload },    // Blue
  POST: { color: '#10B981', icon: FiUpload },     // Green
  PUT: { color: '#F59E0B', icon: FiEdit2 },       // Yellow
  DELETE: { color: '#EF4444', icon: FiTrash2 },   // Red
  PATCH: { color: '#8B5CF6', icon: FiEdit3 },     // Purple
  HEAD: { color: '#6B7280', icon: FiInfo },       // Gray
  OPTIONS: { color: '#EC4899', icon: FiSettings }, // Pink
  TRACE: { color: '#14B8A6', icon: FiSearch },    // Teal
  CONNECT: { color: '#F97316', icon: FiLink }     // Orange
};

const Dashboard = ({ logData }) => {
  const [countryData, setCountryData] = React.useState([]);

  // Add ref to track if component is mounted
  const isMounted = React.useRef(true);
  
  React.useEffect(() => {
    // Set up mount status
    isMounted.current = true;
    
    const getCountryData = async () => {
      try {
        if (logData && logData.length > 0) {
          // Check if we have IP addresses
          const ips = logData.map(log => log.ip).filter(Boolean);
          if (ips.length === 0) {
            return;
          }
          
          const countries = await fetchCountryData(ips);
          
          // Only update state if component is still mounted
          if (isMounted.current) {
            setCountryData(countries);
          }
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };

    getCountryData();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [logData]);

  const analytics = useMemo(() => {
    const now = new Date();
    const stats = {
      statusCodes: {},
      hourlyRequests: Array(24).fill(0),
      methodCounts: {},
      ipAddresses: new Set(),
      endpoints: {},
      bytesPerHour: Array(24).fill(0),
      responseTimePerHour: Array(24).fill([]),
      errors: {
        client: 0,
        server: 0,
        timeline: Array(24).fill(0)
      },
      peakTraffic: {
        hour: 0,
        count: 0
      },
      userAgents: {},
      browserStats: {},
      osStats: {},
      securityEvents: {
        suspicious: 0,
        blocked: 0,
        allowed: 0
      },
      timeDistribution: {
        morning: 0,    // 6-12
        afternoon: 0,  // 12-18
        evening: 0,    // 18-24
        night: 0       // 0-6
      },
      performance: {
        avgResponseTime: 0,
        slowestEndpoints: [],
        fastestEndpoints: []
      },
      patterns: {
        burstTraffic: [],
        quietPeriods: [],
        anomalies: []
      }
    };

    logData.forEach(log => {
      const timestamp = new Date(log.timestamp);
      const hour = timestamp.getHours();
      const status = parseInt(log.statusCode);
      const bytes = parseInt(log.bytes || 0);
      const responseTime = parseFloat(log.responseTime || 0);

      // Status codes and errors
      stats.statusCodes[status] = (stats.statusCodes[status] || 0) + 1;
      if (status >= 400 && status < 500) stats.errors.client++;
      if (status >= 500) stats.errors.server++;
      if (status >= 400) stats.errors.timeline[hour]++;

      // Traffic patterns
      stats.hourlyRequests[hour]++;
      if (stats.hourlyRequests[hour] > stats.peakTraffic.count) {
        stats.peakTraffic = { hour, count: stats.hourlyRequests[hour] };
      }

      // Methods and endpoints
      stats.methodCounts[log.method] = (stats.methodCounts[log.method] || 0) + 1;
      stats.endpoints[log.path] = (stats.endpoints[log.path] || 0) + 1;

      // Performance metrics
      stats.bytesPerHour[hour] += bytes;
      stats.responseTimePerHour[hour].push(responseTime);

      // Unique visitors
      stats.ipAddresses.add(log.ip);

      // Better User Agent Analysis
      const { browser, os } = parseUserAgent(log.userAgent);
      
      // Browser Stats
      stats.browserStats[browser] = (stats.browserStats[browser] || 0) + 1;
      
      // OS Stats
      stats.osStats[os] = (stats.osStats[os] || 0) + 1;

      // Time Distribution
      if (hour >= 6 && hour < 12) stats.timeDistribution.morning++;
      else if (hour >= 12 && hour < 18) stats.timeDistribution.afternoon++;
      else if (hour >= 18) stats.timeDistribution.evening++;
      else stats.timeDistribution.night++;

      // Security Events
      if (status >= 400) {
        if (status === 403) stats.securityEvents.blocked++;
        else if (status >= 400) stats.securityEvents.suspicious++;
        else stats.securityEvents.allowed++;
      }
    });

    // Calculate averages and identify trends
    const avgResponseTimes = stats.responseTimePerHour.map(times => 
      times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
    );

    // Calculate performance metrics
    const endpointPerformance = {};
    logData.forEach(log => {
      if (!endpointPerformance[log.path]) {
        endpointPerformance[log.path] = {
          path: log.path,
          times: [],
          count: 0
        };
      }
      endpointPerformance[log.path].times.push(parseFloat(log.responseTime || 0));
      endpointPerformance[log.path].count++;
    });

    // Process endpoint performance
    const endpoints = Object.values(endpointPerformance).map(ep => ({
      path: ep.path,
      avgTime: ep.times.reduce((a, b) => a + b, 0) / ep.times.length,
      count: ep.count
    }));

    stats.performance = {
      avgResponseTime: endpoints.reduce((acc, ep) => acc + ep.avgTime, 0) / endpoints.length,
      slowestEndpoints: endpoints.sort((a, b) => b.avgTime - a.avgTime).slice(0, 5),
      fastestEndpoints: endpoints.sort((a, b) => a.avgTime - b.avgTime).slice(0, 5)
    };

    // Enhanced time distribution data with specific ranges
    const timeDistributionData = [
      { 
        name: 'Morning',
        value: stats.timeDistribution.morning,
        range: '6:00 AM - 11:59 AM',
        percent: ((stats.timeDistribution.morning / logData.length) * 100).toFixed(1)
      },
      { 
        name: 'Noon',
        value: stats.timeDistribution.afternoon,
        range: '12:00 PM - 4:59 PM',
        percent: ((stats.timeDistribution.afternoon / logData.length) * 100).toFixed(1)
      },
      { 
        name: 'Evening',
        value: stats.timeDistribution.evening,
        range: '5:00 PM - 8:59 PM',
        percent: ((stats.timeDistribution.evening / logData.length) * 100).toFixed(1)
      },
      { 
        name: 'Night',
        value: stats.timeDistribution.night,
        range: '9:00 PM - 5:59 AM',
        percent: ((stats.timeDistribution.night / logData.length) * 100).toFixed(1)
      }
    ];

    return {
      ...stats,
      uniqueVisitors: stats.ipAddresses.size,
      totalRequests: logData.length,
      avgResponseTimes,
      topEndpoints: Object.entries(stats.endpoints)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      successRate: ((logData.length - stats.errors.client - stats.errors.server) / logData.length * 100).toFixed(1),
      browserChartData: Object.entries(stats.browserStats)
        .sort((a, b) => b[1] - a[1])
        .map(([browser, count]) => ({
          name: browser,
          value: count,
          percentage: ((count / logData.length) * 100).toFixed(1)
        })),
      osChartData: Object.entries(stats.osStats)
        .sort((a, b) => b[1] - a[1])
        .map(([os, count]) => ({
          name: os,
          value: count,
          percentage: ((count / logData.length) * 100).toFixed(1)
        })),
      timeDistributionData,
      securityEvents: stats.securityEvents
    };
  }, [logData]);

  const countryAnalytics = useMemo(() => {
    if (!countryData.length || !logData.length) return [];

    // Create a map of IP to country code
    const ipCountryMap = new Map();
    countryData.forEach(country => {
      country.ips?.forEach(ip => {
        ipCountryMap.set(ip, country.code);
      });
    });

    return countryData.map(country => {
      const countryLogs = logData.filter(log => 
        ipCountryMap.get(log.ip) === country.code
      );

      const errors = countryLogs.filter(log => parseInt(log.statusCode) >= 400).length;
      const totalResponseTime = countryLogs.reduce((sum, log) => 
        sum + parseFloat(log.responseTime || 0), 0);

      return {
        name: country.name,
        code: country.code,
        requests: country.count || countryLogs.length,
        errors,
        errorRate: ((errors / (country.count || countryLogs.length)) * 100).toFixed(1),
        avgResponseTime: countryLogs.length ? (totalResponseTime / countryLogs.length).toFixed(2) : '0.00'
      };
    }).filter(country => country.requests > 0);
  }, [countryData, logData]);

  // Transform data for charts
  const statusChartData = Object.entries(analytics.statusCodes).map(([code, count]) => ({
    name: code,
    value: count
  }));

  const trafficData = analytics.hourlyRequests.map((requests, hour) => ({
    hour,
    requests,
    errors: analytics.errors.timeline[hour],
    responseTime: analytics.avgResponseTimes[hour].toFixed(2),
    bandwidth: (analytics.bytesPerHour[hour] / (1024 * 1024)).toFixed(2)
  }));

  const methodData = Object.entries(analytics.methodCounts).map(([method, count]) => ({
    name: method,
    value: count
  }));

  // Color schemes
  const colors = {
    success: '#10B981',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    purple: '#8B5CF6',
    gray: '#E5E7EB',
    indigo: '#6366F1'
  };

  const getStatusColor = (status) => {
    if (status >= 500) return colors.error;
    if (status >= 400) return colors.warning;
    if (status >= 300) return colors.info;
    if (status >= 200) return colors.success;
    return colors.gray;
  };

  // CustomPieTooltip to handle different chart types
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    // Handling different chart types
    if (data.percentage !== undefined) {
      // For pie charts (browser and OS distribution)
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {data.value.toLocaleString()} requests ({data.percentage}%)
          </p>
        </div>
      );
    } else if (data.requests !== undefined) {
      // For traffic overview
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800">Hour: {data.hour}:00</p>
          <div className="mt-1 space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm text-gray-600">
                {entry.name}: {entry.value.toLocaleString()}
                {entry.name === 'bandwidth' && ' MB'}
                {entry.name === 'responseTime' && ' ms'}
              </p>
            ))}
          </div>
        </div>
      );
    } else {
      // For other charts
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {(data.value || data.requests || 0).toLocaleString()}
          </p>
        </div>
      );
    }
  };

  const MetricCard = ({ icon: Icon, title, value, subtext, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtext}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  );

  const SecurityMetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  );

  // Chart components to use the tooltip
  const ResponsivePieChart = ({ data, colors }) => (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percentage }) => `${name} (${percentage}%)`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
          <Legend 
            layout="vertical" 
            align="right"
            verticalAlign="middle"
            formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  // Other chart components to use the same tooltip
  const ResponsiveBarChart = ({ data, colors }) => (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            tickFormatter={(value) => {
              const item = data.find(d => d.name === value);
              return `${value} (${item.range})`;
            }}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              const item = data.find(d => d.name === label);
              
              return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-600">{item.range}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-600">Requests:</span>
                      <span className="font-medium text-gray-900">{payload[0].value}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-600">Percentage:</span>
                      <span className="font-medium text-gray-900">{item.percent}%</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill={colors[0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  //color schemes
  const chartColors = {
    browsers: ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#6B7280'],
    os: ['#2563EB', '#DC2626', '#047857', '#7C3AED', '#D97706', '#4B5563'],
    time: ['#93C5FD', '#60A5FA', '#3B82F6', '#1D4ED8']
  };

  const CountryTable = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'requests', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    // Sort and filter data
    const filteredData = useMemo(() => {
      let filtered = [...data];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(country => 
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        return sortConfig.direction === 'asc'
          ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
          : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
      });

      return filtered;
    }, [data, searchTerm, sortConfig]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    // Handle sort
    const handleSort = (key) => {
      setSortConfig(current => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
      }));
    };

    // Get sort indicator
    const getSortIndicator = (key) => {
      if (sortConfig.key !== key) return '↕';
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          {/* Enhanced Rows Per Page Selector */}
          <div className="relative group">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Rows per page</span>
                <span className="text-sm text-gray-700">{rowsPerPage} entries</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {ROWS_PER_PAGE_OPTIONS.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setRowsPerPage(size);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors
                    ${rowsPerPage === size ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
                    ${size === ROWS_PER_PAGE_OPTIONS[0] ? 'rounded-t-lg' : ''}
                    ${size === ROWS_PER_PAGE_OPTIONS[ROWS_PER_PAGE_OPTIONS.length - 1] ? 'rounded-b-lg' : ''}
                  `}
                >
                  {size} entries
                </button>
              ))}
            </div>
          </div>

          {/* Search Input - Keep existing code */}
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search countries..."
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Table Info */}
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {filteredData.length === data.length ? (
              <span>Total {data.length} entries</span>
            ) : (
              <span>Filtered {filteredData.length} from {data.length}</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Country {getSortIndicator('name')}
                </th>
                <th 
                  onClick={() => handleSort('code')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Code {getSortIndicator('code')}
                </th>
                <th 
                  onClick={() => handleSort('requests')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Requests {getSortIndicator('requests')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((country, index) => (
                <tr 
                  key={country.code}
                  className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`${FLAG_BASE_URL}/${country.code.toLowerCase()}.png`}
                        alt={`${country.name} flag`}
                        className="w-5 h-4 object-cover rounded-sm shadow-sm"
                        onError={(e) => {
                          e.target.src = `${FLAG_BASE_URL}/xx.png`; // Fallback flag for unknown countries
                          e.target.alt = 'Unknown country flag';
                        }}
                      />
                      <span className="text-sm text-gray-900">{country.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {country.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {country.requests.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
            {searchTerm && ` (filtered from ${data.length} total entries)`}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronsLeft />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronLeft />
            </button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronRight />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <FiChevronsRight />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add this new component for the enhanced HTTP Methods chart
  const HTTPMethodsChart = ({ data }) => {
    const [selectedMethods, setSelectedMethods] = useState(Object.keys(HTTP_METHODS));
    const [timeRange, setTimeRange] = useState('hour'); // hour, day, week, month

    const chartData = useMemo(() => {
      if (!data || data.length === 0) return [];

      // Group data by time interval and method
      const timeGroups = data.reduce((acc, log) => {
        const date = new Date(log.timestamp);
        let timeKey;

        switch (timeRange) {
          case 'hour':
            timeKey = date.setMinutes(date.getMinutes() - date.getMinutes() % 15, 0, 0); // 15-min intervals
            break;
          case 'day':
            timeKey = date.setHours(date.getHours(), 0, 0, 0);
            break;
          case 'week':
            timeKey = date.setHours(0, 0, 0, 0);
            break;
          case 'month':
            timeKey = date.setDate(1);
            break;
          default:
            timeKey = date.setMinutes(0, 0, 0);
        }

        if (!acc[timeKey]) {
          acc[timeKey] = Object.keys(HTTP_METHODS).reduce((methods, method) => {
            methods[method] = 0;
            return methods;
          }, {});
        }
        
        acc[timeKey][log.method] = (acc[timeKey][log.method] || 0) + 1;
        return acc;
      }, {});

      // Convert to array and sort by time
      return Object.entries(timeGroups)
        .map(([time, methods]) => ({
          time: new Date(parseInt(time)),
          ...methods
        }))
        .sort((a, b) => a.time - b.time);
    }, [data, timeRange]);

    const formatTime = (time) => {
      switch (timeRange) {
        case 'hour':
          return format(time, 'HH:mm');
        case 'day':
          return format(time, 'HH:00');
        case 'week':
          return format(time, 'MM/dd');
        case 'month':
          return format(time, 'MM/dd');
        default:
          return format(time, 'HH:mm');
      }
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">HTTP Methods Over Time</h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Time Range Selector */}
            <div className="flex rounded-lg border border-gray-200 p-1">
              {['hour', 'day', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Method Toggles */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(HTTP_METHODS).map(([method, { color, icon: Icon }]) => (
                <button
                  key={method}
                  onClick={() => {
                    setSelectedMethods(prev => 
                      prev.includes(method)
                        ? prev.filter(m => m !== method)
                        : [...prev, method]
                    );
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedMethods.includes(method)
                      ? 'bg-opacity-15 text-opacity-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  style={{
                    backgroundColor: selectedMethods.includes(method) 
                      ? `${color}26` // 15% opacity
                      : undefined,
                    color: selectedMethods.includes(method) ? color : undefined
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time" 
                tickFormatter={formatTime}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;

                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-medium text-gray-900 mb-2">
                        {format(new Date(label), 'MMM d, yyyy HH:mm')}
                      </p>
                      <div className="space-y-1">
                        {payload
                          .filter(p => selectedMethods.includes(p.name))
                          .sort((a, b) => b.value - a.value)
                          .map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-sm text-gray-600">{p.name}:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {p.value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                }}
              />
              {selectedMethods.map(method => (
                <Area
                  key={method}
                  type="monotone"
                  dataKey={method}
                  stroke={HTTP_METHODS[method].color}
                  fill={`${HTTP_METHODS[method].color}33`} // 20% opacity
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  stackId="1"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={FiTrendingUp}
          title="Success Rate"
          value={`${analytics.successRate}%`}
          subtext={`${analytics.totalRequests} total requests`}
          color="green"
        />
        <MetricCard
          icon={FiGlobe}
          title="Unique Visitors"
          value={analytics.uniqueVisitors}
          subtext="Distinct IP addresses"
          color="blue"
        />
        <MetricCard
          icon={FiAlertTriangle}
          title="Error Count"
          value={analytics.errors.client + analytics.errors.server}
          subtext={`${analytics.errors.client} client, ${analytics.errors.server} server`}
          color="red"
        />
        <MetricCard
          icon={FiActivity}
          title="Peak Traffic"
          value={`${analytics.peakTraffic.count} req/h`}
          subtext={`at ${analytics.peakTraffic.hour}:00`}
          color="purple"
        />
      </div>

      {/* Traffic Graph */}
      <TrafficGraph logData={logData} />

      {/* Traffic Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Overview - Full Width on Mobile */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Traffic Overview</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.info} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={colors.info} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.error} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={colors.error} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gray} />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="requests"
                  name="Requests"
                  stroke={colors.info}
                  fill="url(#colorRequests)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  name="Errors"
                  stroke={colors.error}
                  fill="url(#colorErrors)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Codes</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={getStatusColor(parseInt(entry.name))}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country Analytics Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Geographic Distribution</h3>
        </div>
        
        <CountryTable data={countryAnalytics} />
      </div>

      {/* Client Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browser Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Browser Distribution</h3>
          <div className="h-80">
            <ResponsivePieChart 
              data={analytics.browserChartData} 
              colors={chartColors.browsers}
            />
          </div>
        </div>

        {/* OS Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Operating Systems</h3>
          <div className="h-80">
            <ResponsivePieChart 
              data={analytics.osChartData} 
              colors={chartColors.os}
            />
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Traffic by Time</h3>
          <div className="flex items-center space-x-2">
            {analytics.timeDistributionData.map((item, index) => (
              <div 
                key={index}
                className="flex items-center space-x-1 text-xs"
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: chartColors.time[index] }}
                />
                <span className="text-gray-600">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveBarChart 
            data={analytics.timeDistributionData} 
            colors={chartColors.time}
          />
        </div>
      </div>

      {/* HTTP Methods Over Time */}
      <HTTPMethodsChart data={logData} />
    </div>
  );
};

// Custom scrollbar styles to your CSS
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #E5E7EB transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #E5E7EB;
    border-radius: 3px;
  }
`;

export default Dashboard; 