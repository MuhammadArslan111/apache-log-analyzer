// Adding necessary React hooks and components
import React, { useState, useMemo, useRef, useEffect } from 'react';
// Adding icons from react-icons/fi library for UI elements
import { 
  FiFilter, FiClock, FiHash, FiGlobe, FiSearch, 
  FiRefreshCw, FiX, FiChevronDown, FiTag, FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiUsers, FiActivity, FiBarChart2, FiPieChart,
  FiServer, FiShield, FiCalendar, FiAlertOctagon, FiZap, FiTrendingDown
} from 'react-icons/fi';
// Adding required date picker styles and utilities
import "react-datepicker/dist/react-datepicker.css";
import { format, isValid, isAfter } from 'date-fns';
// Adding custom components and utilities
import TimeRangeFilter from './TimeRangeFilter';
import { toast } from 'react-toastify';
import { filterLogs } from '../../utils/logProcessing';

// Adding predefined recommended filters for quick access
const RECOMMENDED_FILTERS = [
  { 
    name: 'Errors Only', 
    filters: { statusCode: '400', startTime: '', endTime: '', ip: '' }
  },
  { 
    name: 'Server Errors', 
    filters: { statusCode: '500', startTime: '', endTime: '', ip: '' }
  },
  { 
    name: 'Last Hour Traffic', 
    filters: { 
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      statusCode: '',
      ip: ''
    }
  }
];

// Adding MetricBadge component for displaying metrics with icons and trends
const MetricBadge = ({ icon: Icon, label, value, trend, color }) => (
  <div className="flex items-center space-x-2 text-xs text-gray-500">
    <Icon className={`w-4 h-4 ${color}`} />
    <span>{label}</span>
    <span className={`font-medium ${color}`}>{value}</span>
    {trend && (
      <span className={`flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend > 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
        {Math.abs(trend)}%
      </span>
    )}
  </div>
);

// Adding helper function for formatting date and time consistently
const formatDateTime = (date) => {
  const formattedDate = format(date, 'MMM d, yyyy');
  const formattedTime = format(date, 'hh:mm a'); // This will show time in 12-hour format with AM/PM
  return { date: formattedDate, time: formattedTime };
};

// Adding LogSummaryCards component to display log statistics and metrics
const LogSummaryCards = ({ data }) => {
  // Adding stats calculation using useMemo for performance
  const stats = useMemo(() => {
    try {
      const total = data.length;
      if (total === 0) {
        return {
          total: 0,
          errors: 0,
          successRate: '0.0',
          errorRate: '0.0',
          startDate: new Date(),
          endDate: new Date(),
          uniqueIPs: 0,
          topMethod: ['N/A', 0],
          avgRequestsPerMinute: '0.00'
        };
      }

      const errors = data.filter(log => parseInt(log.statusCode) >= 400).length;
      const startDate = new Date(Math.min(...data.map(log => new Date(log.timestamp))));
      const endDate = new Date(Math.max(...data.map(log => new Date(log.timestamp))));
      
      // Calculate additional stats
      const uniqueIPs = new Set(data.map(log => log.ip)).size;
      const methods = Object.entries(
        data.reduce((acc, log) => {
          acc[log.method] = (acc[log.method] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]);

      const topMethod = methods[0];
      const avgRequestsPerMinute = total / ((endDate - startDate) / (1000 * 60));

      return {
        total,
        errors,
        successRate: ((total - errors) / total * 100).toFixed(1),
        errorRate: ((errors / total) * 100).toFixed(1),
        startDate,
        endDate,
        uniqueIPs,
        topMethod,
        avgRequestsPerMinute: avgRequestsPerMinute.toFixed(2)
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        total: 0,
        errors: 0,
        successRate: '0.0',
        errorRate: '0.0',
        startDate: new Date(),
        endDate: new Date(),
        uniqueIPs: 0,
        topMethod: ['N/A', 0],
        avgRequestsPerMinute: '0.00'
      };
    }
  }, [data]);

  // Add more detailed stats
  const detailedStats = useMemo(() => {
    if (data.length === 0) return null;

    const methodStats = data.reduce((acc, log) => {
      acc[log.method] = (acc[log.method] || 0) + 1;
      return acc;
    }, {});

    const statusGroups = data.reduce((acc, log) => {
      const statusGroup = Math.floor(parseInt(log.statusCode) / 100) * 100;
      acc[statusGroup] = (acc[statusGroup] || 0) + 1;
      return acc;
    }, {});

    return {
      methodStats,
      statusGroups,
      peakHour: data.reduce((acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Range Card - Enhanced */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <FiClock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Time Range</h3>
              </div>
              
              {/* Updated Time Display */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">From</p>
                  <div className="bg-gray-50 rounded-lg p-2 group-hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-800 flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-blue-500" />
                      <span>{formatDateTime(stats.startDate).date}</span>
                    </p>
                    <p className="text-sm font-medium text-gray-800 flex items-center space-x-2 mt-1">
                      <FiClock className="w-4 h-4 text-yellow-500" />
                      <span>{formatDateTime(stats.startDate).time}</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">To</p>
                  <div className="bg-gray-50 rounded-lg p-2 group-hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-800 flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-blue-500" />
                      <span>{formatDateTime(stats.endDate).date}</span>
                    </p>
                    <p className="text-sm font-medium text-gray-800 flex items-center space-x-2 mt-1">
                      <FiClock className="w-4 h-4 text-yellow-500" />
                      <span>{formatDateTime(stats.endDate).time}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <MetricBadge
                  icon={FiActivity}
                  label="Req/min"
                  value={stats.avgRequestsPerMinute}
                  color="text-blue-500"
                />
                <MetricBadge
                  icon={FiServer}
                  label="Peak"
                  value={`${Math.max(...Object.values(detailedStats?.peakHour || {}))} req/hr`}
                  color="text-purple-500"
                />
              </div>
            </div>
            <div className="relative h-16 w-16 group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-blue-100 rounded-full animate-pulse delay-75" />
              <div className="absolute inset-4 bg-blue-200 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        </div>

        {/* Total Requests Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FiBarChart2 className="w-5 h-5 text-purple-500" />
                <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <FiUsers className="w-4 h-4 mr-1" />
                    <span>{stats.uniqueIPs} unique IPs</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{stats.topMethod?.[0]} {((stats.topMethod?.[1] / stats.total) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16 w-16">
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-purple-50 rounded-full" />
                <div className="absolute inset-2 bg-purple-100 rounded-full" />
                <div className="absolute inset-4 bg-purple-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FiCheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-green-500">
                  {stats.successRate}%
                </p>
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                      style={{ width: `${stats.successRate}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {(stats.total - stats.errors).toLocaleString()} successful requests
                  </p>
                </div>
              </div>
            </div>
            <div className="h-16 w-16">
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-green-50 rounded-full" />
                <div className="absolute inset-2 bg-green-100 rounded-full" />
                <div className="absolute inset-4 bg-green-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Rate Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FiAlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-medium text-gray-600">Error Rate</h3>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-red-500">
                  {stats.errorRate}%
                </p>
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                      style={{ width: `${stats.errorRate}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {stats.errors.toLocaleString()} failed requests
                  </p>
                </div>
              </div>
            </div>
            <div className="h-16 w-16">
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-red-50 rounded-full" />
                <div className="absolute inset-2 bg-red-100 rounded-full" />
                <div className="absolute inset-4 bg-red-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New: Method Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center space-x-2">
            <FiPieChart className="w-5 h-5 text-indigo-500" />
            <span>HTTP Methods Distribution</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(detailedStats?.methodStats || {}).map(([method, count]) => (
              <div key={method} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{method}</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {((count / data.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(count / data.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Code Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center space-x-2">
            <FiShield className="w-5 h-5 text-teal-500" />
            <span>Status Codes Distribution</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(detailedStats?.statusGroups || {}).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{status}s</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {((count / data.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status === '200' ? 'bg-green-500' :
                      status === '300' ? 'bg-blue-500' :
                      status === '400' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${(count / data.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Adding IPFilterPopover component for IP address filtering
const IPFilterPopover = ({ filters, onFilterChange, onClose }) => {
  // Adding state management for IP input and selection
  const [ipInput, setIpInput] = useState('');
  const [selectedIPs, setSelectedIPs] = useState(filters.ip ? filters.ip.split(',') : []);

  // Adding IP handling functions
  const handleAddIP = () => {
    if (ipInput && !selectedIPs.includes(ipInput)) {
      setSelectedIPs(prev => [...prev, ipInput]);
      setIpInput('');
    }
  };

  const handleRemoveIP = (ip) => {
    setSelectedIPs(prev => prev.filter(i => i !== ip));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIP();
    }
  };

  const handleApply = () => {
    onFilterChange({
      ...filters,
      ip: selectedIPs.join(',')
    });
    onClose();
  };

  return (
    <div className="absolute mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">IP Addresses</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* IP Input */}
      <div className="mb-3">
        <div className="relative flex space-x-2">
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter IP address..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleAddIP}
            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected IPs */}
      {selectedIPs.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedIPs.map(ip => (
              <div
                key={ip}
                className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm"
              >
                <span>{ip}</span>
                <button
                  onClick={() => handleRemoveIP(ip)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={() => setSelectedIPs([])}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear All
        </button>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// Adding main FilterSection component
const FilterSection = ({ filters, onFilterChange, onSearch: parentOnSearch, onReset, data, setFilteredData }) => {
  // Adding state management for filter UI
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [showRecommendedMenu, setShowRecommendedMenu] = useState(false);
  // Adding refs for handling click outside
  const filterRef = useRef(null);
  const recommendedButtonRef = useRef(null);

  // Helper functions for recommended filters - Move these up
  const getTimeForErrorRate = (data, threshold) => {
    if (!data || data.length === 0) return '';
    
    // Find the time period with highest error rate
    const hourlyErrors = data.reduce((acc, log) => {
      const hour = new Date(log.timestamp).setMinutes(0, 0, 0);
      if (!acc[hour]) {
        acc[hour] = { total: 0, errors: 0 };
      }
      acc[hour].total++;
      if (parseInt(log.statusCode) >= 400) {
        acc[hour].errors++;
      }
      return acc;
    }, {});

    // Find hour with highest error rate
    let maxErrorHour = null;
    let maxErrorRate = 0;

    Object.entries(hourlyErrors).forEach(([hour, stats]) => {
      const errorRate = stats.errors / stats.total;
      if (errorRate > maxErrorRate && errorRate >= threshold) {
        maxErrorRate = errorRate;
        maxErrorHour = parseInt(hour);
      }
    });

    return maxErrorHour ? new Date(maxErrorHour).toISOString().slice(0, 16) : '';
  };

  // Adding helper for peak traffic analysis
  const getPeakTrafficTime = (data) => {
    if (!data || data.length === 0) return '';
    
    // Group requests by hour
    const hourlyTraffic = data.reduce((acc, log) => {
      const hour = new Date(log.timestamp).setMinutes(0, 0, 0);
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Find hour with maximum traffic
    const peakHour = Object.entries(hourlyTraffic)
      .sort(([, a], [, b]) => b - a)[0][0];

    return new Date(parseInt(peakHour)).toISOString().slice(0, 16);
  };

  // Adding helper for recent time calculations
  const getLastHourTime = () => {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    return date.toISOString().slice(0, 16);
  };

  // Adding helper for response time analysis
  const getSlowResponseTimes = (data) => {
    if (!data || data.length === 0) return '';
    
    // Calculate average response time
    const avgResponseTime = data.reduce((sum, log) => sum + (log.responseTime || 0), 0) / data.length;
    const threshold = avgResponseTime * 1.5; // 50% slower than average

    // Find the hour with most slow responses
    const hourlySlowResponses = data.reduce((acc, log) => {
      if (log.responseTime > threshold) {
        const hour = new Date(log.timestamp).setMinutes(0, 0, 0);
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {});

    const peakSlowHour = Object.entries(hourlySlowResponses)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    return peakSlowHour ? new Date(parseInt(peakSlowHour)).toISOString().slice(0, 16) : '';
  };

  // Now define recommendedFilters after the helper functions
  const recommendedFilters = [
    {
      id: 'errors',
      name: 'High Error Rate',
      icon: <FiAlertTriangle className="w-4 h-4 text-red-500" />,
      description: 'Shows periods with error rates above 5%',
      filter: {
        startTime: getTimeForErrorRate(data, 0.05),
        endTime: '',
        statusCode: '5xx,4xx'
      }
    },
    {
      id: 'peak',
      name: 'Peak Traffic Hours',
      icon: <FiTrendingUp className="w-4 h-4 text-blue-500" />,
      description: 'Shows periods of highest request volume',
      filter: {
        startTime: getPeakTrafficTime(data),
        endTime: '',
        statusCode: ''
      }
    },
    {
      id: 'recent',
      name: 'Last Hour',
      icon: <FiClock className="w-4 h-4 text-green-500" />,
      description: 'Shows the most recent hour of logs',
      filter: {
        startTime: getLastHourTime(),
        endTime: '',
        statusCode: ''
      }
    },
    {
      id: 'critical',
      name: 'Critical Errors',
      icon: <FiAlertOctagon className="w-4 h-4 text-purple-500" />,
      description: 'Shows only 5xx server errors',
      filter: {
        startTime: '',
        endTime: '',
        statusCode: '5xx'
      }
    },
    {
      id: 'slow',
      name: 'Slow Responses',
      icon: <FiZap className="w-4 h-4 text-orange-500" />,
      description: 'Shows requests with high response times',
      filter: {
        startTime: getSlowResponseTimes(data),
        endTime: '',
        statusCode: ''
      }
    }
  ];

  // Adding click outside handler effect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilter(null);
        setShowRecommendedMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Adding filter handling functions
  const handleDateChange = (date, field) => {
    onFilterChange({
      ...filters,
      [field]: date ? date.toISOString() : ''
    });
  };

  // Helper to check if a filter is active
  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'startTime' || key === 'endTime') {
        return !!value;
      }
      return value.trim() !== '';
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'startTime' || key === 'endTime') {
        return !!value;
      }
      return value.trim() !== '';
    }).length;
  };

  // Format the time range for display
  const getTimeRangeDisplay = () => {
    if (filters.startTime && filters.endTime) {
      const start = new Date(filters.startTime);
      const end = new Date(filters.endTime);
      return `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`;
    }
    return 'All Time';
  };

  // Add this helper function to handle filter removal
  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    if (filterKey === 'time') {
      newFilters.startTime = '';
      newFilters.endTime = '';
    } else {
      newFilters[filterKey] = '';
    }
    onFilterChange(newFilters);
    // Trigger search immediately after removing filter
    setTimeout(() => parentOnSearch(), 0);
  };

  // Adding ActiveFilters component to display currently applied filters
  const ActiveFilters = () => {
    // Adding null check for no active filters
    if (!hasActiveFilters()) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Adding time range filter badge */}
        {filters.startTime && filters.endTime && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
            <FiClock className="w-4 h-4" />
            <span>{getTimeRangeDisplay()}</span>
            <button
              onClick={() => handleRemoveFilter('time')}
              className="hover:text-blue-800"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Adding IP filter badge */}
        {filters.ip && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
            <FiGlobe className="w-4 h-4" />
            <span>
              {filters.ip.split(',').length} IP{filters.ip.split(',').length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => handleRemoveFilter('ip')}
              className="hover:text-green-800"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Adding status code filter badge */}
        {filters.statusCode && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm">
            <FiHash className="w-4 h-4" />
            <span>Status: {filters.statusCode}xx</span>
            <button
              onClick={() => handleRemoveFilter('statusCode')}
              className="hover:text-red-800"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Adding RecommendedFilters component for quick filter presets
  const RecommendedFilters = () => (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-20">
      {/* Adding header section */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Recommended Filters</h4>
        <button
          onClick={() => setShowRecommendedMenu(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
      {/* Adding filter preset options */}
      <div className="space-y-2">
        {RECOMMENDED_FILTERS.map((preset, index) => (
          <button
            key={index}
            onClick={() => {
              onFilterChange(preset.filters);
              setShowRecommendedMenu(false);
              parentOnSearch();
            }}
            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FiTag className="w-4 h-4 text-gray-400" />
              <span>{preset.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Adding FilterPopover component for filter option displays
  const FilterPopover = ({ title, children, isOpen, onClose }) => (
    <div className="relative">
      {isOpen && (
        <div className="absolute mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">{title}</h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );

  // Adding search handler for applying filters
  const handleSearch = () => {
    // Adding validation for date range
    if (filters.startTime && filters.endTime) {
      const start = new Date(filters.startTime);
      const end = new Date(filters.endTime);
      
      if (!isValid(start) || !isValid(end)) {
        toast.error('Invalid date/time range selected');
        return;
      }

      if (isAfter(start, end)) {
        toast.error('Start time cannot be after end time');
        return;
      }
    }

    // Adding filter application with error handling
    try {
      const filtered = filterLogs(data, filters);
      setFilteredData(filtered);
      parentOnSearch();
    } catch (error) {
      console.error('Filter error:', error);
      toast.error('Error applying filters');
    }
  };

  // Adding handler for recommended filter application
  const handleRecommendedFilter = (filter) => {
    // Adding filter merge logic
    const newFilters = {
      ...filters,
      ...filter.filter
    };

    // If no end time is set, set it to current time
    if (newFilters.startTime && !newFilters.endTime) {
      newFilters.endTime = new Date().toISOString().slice(0, 16);
    }

    // Adding filter application and UI updates
    onFilterChange(newFilters);
    setActiveFilter(filter.id);
    setShowRecommendedMenu(false);
    
    // Adding immediate filter application
    const filtered = filterLogs(data, newFilters);
    setFilteredData(filtered);
    parentOnSearch();
  };

  // Adding main return statement with filter UI structure
  return (
    <div className="space-y-6" ref={filterRef}>
      {/* Adding summary cards section */}
      <LogSummaryCards data={data} />
      
      {/* Adding main filter container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Adding filter header section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FiFilter className={`w-5 h-5 ${hasActiveFilters() ? 'text-blue-500' : 'text-gray-400'}`} />
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-800">Filters</h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative" ref={recommendedButtonRef}>
                <button
                  onClick={() => setShowRecommendedMenu(!showRecommendedMenu)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
                    ${activeFilter ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}
                  `}
                >
                  <FiTag className="w-4 h-4" />
                  <span>Recommended Filters</span>
                </button>

                {/* Updated Dropdown Menu */}
                {showRecommendedMenu && (
                  <div 
                    className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    style={{
                      top: '100%',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="p-2">
                      {recommendedFilters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => handleRecommendedFilter(filter)}
                          className={`w-full px-4 py-3 text-left rounded-lg transition-colors hover:bg-gray-50 flex items-start space-x-3
                            ${activeFilter === filter.id ? 'bg-blue-50' : ''}
                          `}
                        >
                          <div className="flex-shrink-0 mt-1">{filter.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{filter.name}</span>
                              {activeFilter === filter.id && (
                                <span className="text-xs font-medium text-blue-600">Active</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{filter.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Footer with Reset */}
                    <div className="border-t border-gray-100 p-2">
                      <button
                        onClick={() => {
                          onReset();
                          setActiveFilter(null);
                          setShowRecommendedMenu(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 flex items-center justify-center"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiChevronDown 
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Adding active filters section */}
        {hasActiveFilters() && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <ActiveFilters />
          </div>
        )}

        {/* Adding expandable filter content */}
        {isExpanded && (
          <div className="p-6 space-y-6">
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Range Filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'time' ? null : 'time')}
                  className={`w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                    activeFilter === 'time' ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {filters.startTime && filters.endTime
                        ? `${format(new Date(filters.startTime), 'MMM d, HH:mm')} - ${format(new Date(filters.endTime), 'MMM d, HH:mm')}`
                        : 'Time Range'}
                    </span>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    activeFilter === 'time' ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Time Range Filter Component */}
                {activeFilter === 'time' && (
                  <TimeRangeFilter
                    filters={filters}
                    onFilterChange={onFilterChange}
                    isOpen={true}
                    onClose={() => setActiveFilter(null)}
                  />
                )}
              </div>

              {/* IP Filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'ip' ? null : 'ip')}
                  className={`w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                    filters.ip ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FiGlobe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {filters.ip 
                        ? `${filters.ip.split(',').length} IP${filters.ip.split(',').length !== 1 ? 's' : ''} selected`
                        : 'IP Address'
                      }
                    </span>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    activeFilter === 'ip' ? 'rotate-180' : ''
                  }`} />
                </button>

                {activeFilter === 'ip' && (
                  <IPFilterPopover
                    filters={filters}
                    onFilterChange={onFilterChange}
                    onClose={() => setActiveFilter(null)}
                  />
                )}
              </div>

              {/* Status Code Filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FiHash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Status Code</span>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    activeFilter === 'status' ? 'rotate-180' : ''
                  }`} />
                </button>

                <FilterPopover
                  title="Status Code Filter"
                  isOpen={activeFilter === 'status'}
                  onClose={() => setActiveFilter(null)}
                >
                  <div className="space-y-2">
                    {[200, 300, 400, 500].map((code) => (
                      <button
                        key={code}
                        onClick={() => onFilterChange({ ...filters, statusCode: code.toString() })}
                        className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                          filters.statusCode === code.toString()
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {code}xx - {code === 200 ? 'Success' : code === 300 ? 'Redirection' : code === 400 ? 'Client Error' : 'Server Error'}
                      </button>
                    ))}
                  </div>
                </FilterPopover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onReset}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSearch}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSearch className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSection;