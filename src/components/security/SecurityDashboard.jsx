import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { 
  FiShield, FiActivity, FiClock, FiAlertOctagon, FiMonitor, FiShield as FiShieldAlt, FiTarget, FiDownload, FiX, FiCalendar,
  FiShieldOff, FiGitCommit, FiRepeat, FiZap,
  FiTrendingUp, FiAlertCircle, FiBarChart2, FiHash, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { getCachedData, setCachedData } from '../../utils/cache';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import TimeRangeFilter from '../filters/TimeRangeFilter';

const ConfirmDialog = ({ isOpen, onClose, onConfirm }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Clear DDoS Detection Configuration
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to clear all DDoS detection settings? This will reset all configurations to their default values.
                </p>
              </div>

              <div className="mt-4 flex space-x-3 justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  Clear
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

const ActiveFilters = ({ config, onRemoveFilter }) => {
  const activeFilters = [];

  if (config.startTime) {
    activeFilters.push({
      id: 'startTime',
      label: `From: ${format(new Date(config.startTime), 'MMM dd, yyyy HH:mm')}`,
    });
  }

  if (config.endTime) {
    activeFilters.push({
      id: 'endTime',
      label: `To: ${format(new Date(config.endTime), 'MMM dd, yyyy HH:mm')}`,
    });
  }

  if (config.threshold !== 100) {
    activeFilters.push({
      id: 'threshold',
      label: `Threshold: ${config.threshold} req/min`,
    });
  }

  if (config.timeWindow !== 5) {
    activeFilters.push({
      id: 'timeWindow',
      label: `Window: ${config.timeWindow} min`,
    });
  }

  if (config.targetIp) {
    activeFilters.push({
      id: 'targetIp',
      label: `IP: ${config.targetIp}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {activeFilters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
        >
          {filter.label}
          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            <FiX className="w-4 h-4" />
          </button>
        </span>
      ))}
    </div>
  );
};

const AffectedIPsModal = ({ isOpen, onClose, ips }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(ips.length / itemsPerPage);

  const paginatedIPs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return ips.slice(start, end);
  }, [ips, currentPage]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Affected IPs
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* IP List */}
                <div className="mt-4">
                  <div className="bg-gray-50 rounded-lg">
                    {paginatedIPs.map((ip, index) => (
                      <div
                        key={ip}
                        className={`flex items-center justify-between p-3 ${
                          index !== paginatedIPs.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-700">{ip}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>Next</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const DDoSDetectionConfig = ({ 
  config, 
  onConfigChange, 
  onAnalyze,
  detectionResults,
  onClear
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showClearFeedback, setShowClearFeedback] = useState(false);
  const [timeUnit, setTimeUnit] = useState('minutes');
  const [showTimeRangeFilter, setShowTimeRangeFilter] = useState(false);
  const [showIPsModal, setShowIPsModal] = useState(false);

  const handleTimeWindowChange = (value, unit) => {
    let timeInMinutes = value;
    switch (unit) {
      case 'hours':
        timeInMinutes = value * 60;
        break;
      case 'seconds':
        timeInMinutes = value / 60;
        break;
      default:
        timeInMinutes = value;
    }
    onConfigChange({ ...config, timeWindow: timeInMinutes });
  };

  const getTimeWindowValue = () => {
    switch (timeUnit) {
      case 'hours':
        return config.timeWindow / 60;
      case 'seconds':
        return config.timeWindow * 60;
      default:
        return config.timeWindow;
    }
  };

  const handleClear = () => {
    onClear();
    setShowClearFeedback(true);
    setTimeout(() => setShowClearFeedback(false), 2000);
  };

  const handleRemoveFilter = (filterId) => {
    switch (filterId) {
      case 'startTime':
      case 'endTime':
        onConfigChange({ ...config, [filterId]: '' });
        break;
      case 'threshold':
        onConfigChange({ ...config, threshold: 100 });
        break;
      case 'timeWindow':
        onConfigChange({ ...config, timeWindow: 5 });
        break;
      case 'targetIp':
        onConfigChange({ ...config, targetIp: '' });
        break;
    }
  };

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">DDoS Detection Configuration</h3>
        <div className="flex items-center space-x-3">
          <AnimatePresence>
            {showClearFeedback && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-sm text-green-600"
              >
                Settings cleared!
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsConfirmOpen(true)}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiX className="w-4 h-4 mr-2" />
            Clear Filters
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAnalyze}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiActivity className="w-4 h-4 mr-2" />
            Analyze Traffic
          </motion.button>
        </div>
      </div>

      {/* Active Filters */}
      <ActiveFilters config={config} onRemoveFilter={handleRemoveFilter} />

      <div className="space-y-6 mt-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Time Range</h4>
          <div className="relative">
            <button
              onClick={() => setShowTimeRangeFilter(!showTimeRangeFilter)}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span className="text-sm text-gray-600">
                {config.startTime && config.endTime
                  ? `${format(new Date(config.startTime), 'MMM dd, yyyy HH:mm')} - ${format(new Date(config.endTime), 'MMM dd, yyyy HH:mm')}`
                  : 'Select time range'}
              </span>
              <FiCalendar className="w-4 h-4 text-gray-400" />
            </button>

            <TimeRangeFilter
              isOpen={showTimeRangeFilter}
              onClose={() => setShowTimeRangeFilter(false)}
              filters={{
                startTime: config.startTime,
                endTime: config.endTime
              }}
              onFilterChange={(newFilters) => {
                onConfigChange({
                  ...config,
                  startTime: newFilters.startTime,
                  endTime: newFilters.endTime
                });
                setShowTimeRangeFilter(false);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Detection Threshold</h4>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Request Threshold
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={config.threshold}
                    onChange={(e) => onConfigChange({ ...config, threshold: e.target.value })}
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10</span>
                    <span>1000</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={config.threshold}
                    onChange={(e) => onConfigChange({ ...config, threshold: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">requests/minute</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Time Window</h4>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={getTimeWindowValue()}
                  onChange={(e) => handleTimeWindowChange(e.target.value, timeUnit)}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
                <option value="seconds">Seconds</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Target IP Configuration</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={config.targetIp}
              onChange={(e) => onConfigChange({ ...config, targetIp: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 192.168.1.1"
            />
            <button
              onClick={() => onConfigChange({ ...config, targetIp: '' })}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {detectionResults && (
        <DDoSAnalysisPanel 
          detectionResults={detectionResults} 
          config={config}
        />
      )}

      <div 
        onClick={() => detectionResults?.affectedIPs?.length && setShowIPsModal(true)}
        className={`cursor-pointer transform transition-transform duration-200 hover:scale-102 ${
          detectionResults?.affectedIPs?.length ? 'hover:shadow-md' : ''
        }`}
      >
        <AnalyticsCard
          title="Affected IPs"
          value={detectionResults?.affectedIPs?.length || 0}
          icon={FiShieldOff}
          color="text-red-500"
          bgColor="bg-red-50"
          subtitle="Click to view details"
        />
      </div>

      <AffectedIPsModal
        isOpen={showIPsModal}
        onClose={() => setShowIPsModal(false)}
        ips={detectionResults?.affectedIPs || []}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleClear}
      />
    </motion.div>
  );
};

const TopIPsTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'requests', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    let processedData = [...data];
    
    // Apply search filter
    if (searchTerm) {
      processedData = processedData.filter(ip => 
        ip.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ip.requests.toString().includes(searchTerm) ||
        ip.errorRate.toString().includes(searchTerm)
      );
    }

    // Apply sorting
    processedData.sort((a, b) => {
      if (sortConfig.key === 'errorRate') {
        return sortConfig.direction === 'asc' 
          ? parseFloat(a.errorRate) - parseFloat(b.errorRate)
          : parseFloat(b.errorRate) - parseFloat(a.errorRate);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    });

    return processedData;
  }, [data, sortConfig, searchTerm]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">IP Address Analysis</h3>
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search IPs..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('address')}
              >
                IP Address {renderSortIndicator('address')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('requests')}
              >
                Requests {renderSortIndicator('requests')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('errorRate')}
              >
                Error Rate {renderSortIndicator('errorRate')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('lastSeen')}
              >
                Last Seen {renderSortIndicator('lastSeen')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredData.map((ip, index) => (
              <tr 
                key={index} 
                className={`${ip.suspicious ? 'bg-red-50' : ''} hover:bg-gray-50 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ip.requests}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ip.errorRate > 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {ip.errorRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ip.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SecurityMetricsChart = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Security Metrics Over Time</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-medium text-gray-900">{label}</p>
                {payload.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-600">{entry.name}:</span>
                    <span className="font-medium text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            );
          }} />
          <Legend />
          <Area type="monotone" dataKey="authFailures" name="Auth Failures" stroke="#EF4444" fill="#FEE2E2" />
          <Area type="monotone" dataKey="suspiciousRequests" name="Suspicious Requests" stroke="#F59E0B" fill="#FEF3C7" />
          <Area type="monotone" dataKey="maliciousPayloads" name="Malicious Payloads" stroke="#8B5CF6" fill="#EDE9FE" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const RequestMethodsSecurityChart = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-lg font-semibold mb-4">HTTP Methods Security Analysis</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="method" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" name="Total Requests" fill="#3B82F6" />
          <Bar dataKey="errors" name="Error Responses" fill="#EF4444" />
          <Bar dataKey="suspicious" name="Suspicious" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const BotActivityDetailPopup = ({ activity, onClose }) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Bot Activity Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                activity.type === 'malicious' ? 'bg-red-100 text-red-800' :
                activity.type === 'crawler' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Last seen: {activity.lastSeen}
              </span>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">IP Address</h4>
                <p className="text-gray-900">{activity.ip}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Total Requests</h4>
                <p className="text-gray-900">{activity.requests}</p>
              </div>
            </div>

            {/* Request Pattern Analysis */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Pattern Analysis</h4>
              <p className="text-gray-900">{activity.pattern}</p>
              {activity.patternDetails && (
                <div className="mt-2 text-sm text-gray-600">
                  {activity.patternDetails}
                </div>
              )}
            </div>

            {/* HTTP Request Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500">HTTP Request Details</h4>
              <div className="bg-gray-900 text-gray-200 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div>User-Agent: {activity.userAgent}</div>
                {activity.requestDetails && (
                  <>
                    <div className="mt-2">Method: {activity.requestDetails.method}</div>
                    <div>Path: {activity.requestDetails.path}</div>
                    <div>Status: {activity.requestDetails.status}</div>
                    {activity.requestDetails.referer && (
                      <div>Referer: {activity.requestDetails.referer}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            {activity.timeline && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Activity Timeline</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activity.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="#3B82F6"
                        fill="#DBEAFE"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Mitigation Recommendations */}
            {activity.type === 'malicious' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">Recommended Actions</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  <li>Block this IP address</li>
                  <li>Update WAF rules</li>
                  <li>Monitor similar patterns</li>
                  <li>Review security logs</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EnhancedBotDetectionPanel = ({ botData }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: 'All Bots', color: 'gray' },
    { id: 'crawler', label: 'Known Crawlers', color: 'blue' },
    { id: 'malicious', label: 'Malicious Bots', color: 'red' },
    { id: 'suspicious', label: 'Suspicious Activity', color: 'yellow' }
  ];

  const filteredActivities = botData.recentActivities.filter(
    activity => selectedCategory === 'all' || activity.type === selectedCategory
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Bot Activity Detection</h3>
        <div className="flex items-center space-x-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category.id
                  ? `bg-${category.color}-100 text-${category.color}-800 border-${category.color}-300`
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } border`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bot Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Known Crawlers</p>
              <p className="text-2xl font-semibold text-blue-700">{botData.knownCrawlers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiMonitor className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-blue-600">
              {((botData.knownCrawlers / botData.totalRequests) * 100).toFixed(1)}% of traffic
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Malicious Bots</p>
              <p className="text-2xl font-semibold text-red-700">{botData.maliciousBots}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiShieldAlt className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-red-600">
              {((botData.maliciousBots / botData.totalRequests) * 100).toFixed(1)}% of traffic
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Suspicious Activity</p>
              <p className="text-2xl font-semibold text-yellow-700">{botData.suspicious}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiTarget className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-yellow-600">
              {((botData.suspicious / botData.totalRequests) * 100).toFixed(1)}% of traffic
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Total Bot Traffic</p>
              <p className="text-2xl font-semibold text-purple-700">{botData.totalBots}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiActivity className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-purple-600">
              {((botData.totalBots / botData.totalRequests) * 100).toFixed(1)}% of total traffic
            </div>
          </div>
        </div>
      </div>

      {/* Bot Activity Timeline */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Bot Activity Timeline</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={botData.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="crawlers" 
                name="Known Crawlers"
                stackId="1"
                stroke="#3B82F6" 
                fill="#DBEAFE" 
              />
              <Area 
                type="monotone" 
                dataKey="malicious" 
                name="Malicious Bots"
                stackId="1"
                stroke="#EF4444" 
                fill="#FEE2E2" 
              />
              <Area 
                type="monotone" 
                dataKey="suspicious" 
                name="Suspicious Activity"
                stackId="1"
                stroke="#F59E0B" 
                fill="#FEF3C7" 
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bot Activity List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Bot Activities</h4>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pattern</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.map((activity, index) => (
                  <tr 
                    key={index}
                    onClick={() => setSelectedActivity(activity)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      activity.type === 'malicious' ? 'bg-red-50' :
                      activity.type === 'crawler' ? 'bg-blue-50' :
                      activity.type === 'suspicious' ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'malicious' ? 'bg-red-100 text-red-800' :
                        activity.type === 'crawler' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.requests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.pattern}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.lastSeen}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {activity.userAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add the detail popup */}
      <AnimatePresence>
        {selectedActivity && (
          <BotActivityDetailPopup
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TopAttackSourcesPanel = ({ attackers }) => {
  const [selectedAttacker, setSelectedAttacker] = useState(null);

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
        <span>Top Attack Sources</span>
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
            High Risk
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></div>
            Medium Risk
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
            Low Risk
          </span>
        </div>
      </h4>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attack Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attackers.map((ip, index) => (
              <React.Fragment key={index}>
                <tr className={`hover:bg-gray-50 ${
                  selectedAttacker === ip ? 'bg-blue-50' : ''
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`w-3 h-3 rounded-full ${
                      ip.riskLevel === 'high' ? 'bg-red-400' :
                      ip.riskLevel === 'medium' ? 'bg-yellow-400' :
                      'bg-blue-400'
                    }`} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{ip.address}</div>
                      {ip.country && (
                        <span className="ml-2 text-xs text-gray-500">{ip.country}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ip.requests}</div>
                    <div className="text-xs text-gray-500">
                      {ip.requestsPerMinute} req/min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ip.pattern.includes('DDoS') ? 'bg-red-100 text-red-800' :
                      ip.pattern.includes('Scan') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ip.pattern}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32 h-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ip.activityTimeline}>
                          <Area 
                            type="monotone" 
                            dataKey="requests" 
                            stroke={
                              ip.riskLevel === 'high' ? '#EF4444' :
                              ip.riskLevel === 'medium' ? '#F59E0B' :
                              '#3B82F6'
                            }
                            fill={
                              ip.riskLevel === 'high' ? '#FEE2E2' :
                              ip.riskLevel === 'medium' ? '#FEF3C7' :
                              '#DBEAFE'
                            }
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedAttacker(selectedAttacker === ip ? null : ip)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {selectedAttacker === ip ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                {selectedAttacker === ip && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Request Pattern</h5>
                          <div className="mt-2 space-y-1">
                            {Object.entries(ip.methodStats).map(([method, count]) => (
                              <div key={method} className="flex justify-between text-sm">
                                <span className="text-gray-600">{method}</span>
                                <span className="text-gray-900">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Response Codes</h5>
                          <div className="mt-2 space-y-1">
                            {Object.entries(ip.statusCodes).map(([code, count]) => (
                              <div key={code} className="flex justify-between text-sm">
                                <span className="text-gray-600">{code}</span>
                                <span className="text-gray-900">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Additional Info</h5>
                          <div className="mt-2 space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">First Seen:</span>
                              <span className="ml-2 text-gray-900">{ip.firstSeen}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Last Seen:</span>
                              <span className="ml-2 text-gray-900">{ip.lastSeen}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">User Agent:</span>
                              <span className="ml-2 text-gray-900 break-all">{ip.userAgent}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DDoSAnalysisPanel = ({ detectionResults, config }) => {
  if (!detectionResults) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-6 rounded-lg ${
        detectionResults.isDDoS ? 'bg-red-50' : 'bg-green-50'
      } border ${
        detectionResults.isDDoS ? 'border-red-200' : 'border-green-200'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${
            detectionResults.isDDoS ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {detectionResults.isDDoS ? (
              <FiAlertOctagon className="w-6 h-6 text-red-600" />
            ) : (
              <FiShield className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${
              detectionResults.isDDoS ? 'text-red-900' : 'text-green-900'
            }`}>
              {detectionResults.isDDoS ? 'DDoS Attack Detected' : 'Normal Traffic Pattern'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{detectionResults.details}</p>
          </div>
        </div>

        {detectionResults.isDDoS && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Peak Traffic Rate</h4>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {detectionResults.peakRate}
                  </p>
                  <p className="ml-2 text-sm text-gray-500">req/min</p>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((detectionResults.peakRate / config?.threshold || 100) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Affected IPs</h4>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {detectionResults.affectedIPs.length}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {((detectionResults.affectedIPs.length / detectionResults.totalIPs) * 100).toFixed(1)}% of total IPs
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Attack Duration</h4>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {detectionResults.duration} min
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {detectionResults.timePeriod}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Attack Pattern Analysis</h4>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={detectionResults.trafficPattern}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="requests" 
                        stroke="#EF4444" 
                        fill="#FEE2E2"
                      />
                      <ReferenceLine 
                        y={config?.threshold} 
                        stroke="#991B1B" 
                        strokeDasharray="3 3"
                        label={{ 
                          value: 'Threshold', 
                          position: 'right',
                          fill: '#991B1B'
                        }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <TopAttackSourcesPanel 
              attackers={detectionResults.topAttackers.map(attacker => ({
                ...attacker,
                riskLevel: attacker.requests > config.threshold ? 'high' :
                          attacker.requests > config.threshold / 2 ? 'medium' : 'low',
                methodStats: attacker.methods || {},
                statusCodes: attacker.statusCodes || {},
                requestsPerMinute: Math.round(attacker.requests / config.timeWindow),
                activityTimeline: attacker.timeline || []
              }))}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {/* Add export functionality */}}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiDownload className="mr-2 -ml-1 h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AnalyticsCard = ({ title, value, trend, icon: Icon, color, bgColor, subtitle }) => (
  <motion.div 
    className={`${bgColor} p-6 rounded-xl hover:shadow-lg transition-shadow`}
    whileHover={{ y: -2 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-semibold ${color} mt-1`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`${color} p-3 rounded-full ${bgColor}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-xs">
        <FiTrendingUp className={trend > 0 ? "text-green-500" : "text-red-500"} />
        <span className={`ml-1 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
          {Math.abs(trend)}% from previous period
        </span>
      </div>
    )}
  </motion.div>
);

const calculateSecurityStats = (logData) => {
  const stats = {
    totalRequests: logData.length,
    uniqueIPs: new Set(),
    attackPatterns: {
      sqlInjection: 0,
      xss: 0,
      pathTraversal: 0,
      commandInjection: 0
    },
    responseStats: {
      success: 0,
      clientError: 0,
      serverError: 0
    },
    timeBasedStats: {
      lastHour: 0,
      previousHour: 0
    },
    geoStats: new Map(),
    methodStats: new Map(),
    highRiskIPs: new Set(),
    recentAttacks: []
  };

  const now = new Date();
  const oneHourAgo = new Date(now - 3600000);
  const twoHoursAgo = new Date(now - 7200000);

  logData.forEach(log => {
    // Collect unique IPs
    stats.uniqueIPs.add(log.ip);

    // Analyze request patterns
    const request = log.request?.toLowerCase() || '';
    if (request.includes('union select') || request.includes('or 1=1')) {
      stats.attackPatterns.sqlInjection++;
    }
    if (request.includes('<script') || request.includes('onerror=')) {
      stats.attackPatterns.xss++;
    }
    if (request.includes('../') || request.includes('..%2f')) {
      stats.attackPatterns.pathTraversal++;
    }
    if (request.includes(';&') || request.includes('|')) {
      stats.attackPatterns.commandInjection++;
    }

    const statusCode = parseInt(log.statusCode);
    if (statusCode >= 200 && statusCode < 300) stats.responseStats.success++;
    if (statusCode >= 400 && statusCode < 500) stats.responseStats.clientError++;
    if (statusCode >= 500) stats.responseStats.serverError++;

    // Time-based analysis
    const logTime = new Date(log.timestamp);
    if (logTime > oneHourAgo) stats.timeBasedStats.lastHour++;
    if (logTime > twoHoursAgo && logTime <= oneHourAgo) stats.timeBasedStats.previousHour++;

    // Geographic stats
    if (log.country) {
      stats.geoStats.set(log.country, (stats.geoStats.get(log.country) || 0) + 1);
    }

    // Method stats
    stats.methodStats.set(log.method, (stats.methodStats.get(log.method) || 0) + 1);

    // High-risk IP detection
    if (statusCode >= 400 || 
        Object.values(stats.attackPatterns).some(count => count > 0)) {
      stats.highRiskIPs.add(log.ip);
    }

    // Recent attacks collection
    if (statusCode >= 400 || request.includes('union select') || request.includes('<script')) {
      stats.recentAttacks.push({
        timestamp: log.timestamp,
        ip: log.ip,
        request: log.request,
        statusCode: statusCode
      });
    }
  });

  // Calculate trends
  stats.requestTrend = stats.timeBasedStats.lastHour === 0 ? 0 :
    ((stats.timeBasedStats.lastHour - stats.timeBasedStats.previousHour) / 
     stats.timeBasedStats.previousHour * 100).toFixed(1);

  return stats;
};

const SecurityDashboard = ({ logData }) => {
  // Remove filter-related state and handlers
  const [filteredData] = useState(logData); // Keep this for DDoS detection

  // Add DDoS detection state
  const defaultDdosConfig = {
    threshold: 100,
    timeWindow: 5,
    targetIp: ''
  };

  const [ddosConfig, setDdosConfig] = useState(defaultDdosConfig);
  const [detectionResults, setDetectionResults] = useState(null);

  // Add DDoS detection function
  const analyzeDDoS = () => {
    const timeWindowMs = ddosConfig.timeWindow * 60 * 1000;
    const threshold = parseInt(ddosConfig.threshold);
    
    // Enhanced analysis
    const requestCounts = {};
    const ipStats = {};
    let attackStartTime = null;
    let attackEndTime = null;
    
    logData.forEach(log => {
      const timestamp = new Date(log.timestamp).getTime();
      const timeWindow = Math.floor(timestamp / timeWindowMs) * timeWindowMs;
      const ip = log.ip;

      if (ddosConfig.targetIp && ip !== ddosConfig.targetIp) return;

      // Track requests per time window
      if (!requestCounts[timeWindow]) {
        requestCounts[timeWindow] = { total: 0, ips: new Set() };
      }
      requestCounts[timeWindow].total++;
      requestCounts[timeWindow].ips.add(ip);

      // Track IP statistics
      if (!ipStats[ip]) {
        ipStats[ip] = {
          address: ip,
          requests: 0,
          firstSeen: timestamp,
          lastSeen: timestamp,
          timeWindows: new Set(),
          pattern: 'Normal'
        };
      }
      ipStats[ip].requests++;
      ipStats[ip].timeWindows.add(timeWindow);
      ipStats[ip].lastSeen = timestamp;
    });

    // Analyze for DDoS
    let isDDoS = false;
    let peakRate = 0;
    let attackDuration = 0;
    const trafficPattern = [];
    
    Object.entries(requestCounts).forEach(([timeWindow, data]) => {
      const requestsPerMinute = data.total / ddosConfig.timeWindow;
      const time = format(parseInt(timeWindow), 'HH:mm');
      
      trafficPattern.push({
        time,
        requests: requestsPerMinute
      });

      if (requestsPerMinute > threshold) {
        isDDoS = true;
        if (requestsPerMinute > peakRate) {
          peakRate = requestsPerMinute;
          attackEndTime = parseInt(timeWindow) + timeWindowMs;
          if (!attackStartTime) {
            attackStartTime = parseInt(timeWindow);
          }
        }
      }
    });

    // Analyze attack patterns
    Object.values(ipStats).forEach(ip => {
      if (ip.requests > threshold) {
        ip.pattern = 'High volume traffic';
      } else if (ip.timeWindows.size === 1 && ip.requests > threshold / 2) {
        ip.pattern = 'Burst attack';
      } else if (ip.timeWindows.size > 5) {
        ip.pattern = 'Distributed attack';
      }
    });

    const results = {
      isDDoS,
      peakRate: Math.round(peakRate),
      affectedIPs: Object.keys(ipStats).filter(ip => ipStats[ip].requests > threshold / 10),
      totalIPs: Object.keys(ipStats).length,
      duration: attackStartTime ? Math.ceil((attackEndTime - attackStartTime) / (60 * 1000)) : 0,
      timePeriod: attackStartTime ? 
        `${format(attackStartTime, 'HH:mm')} - ${format(attackEndTime, 'HH:mm')}` : 
        'N/A',
      trafficPattern: trafficPattern.sort((a, b) => a.time.localeCompare(b.time)),
      topAttackers: Object.values(ipStats)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5)
        .map(ip => ({
          ...ip,
          firstSeen: format(ip.firstSeen, 'HH:mm:ss')
        })),
      details: isDDoS
        ? `Detected abnormal traffic pattern exceeding threshold of ${threshold} requests/minute`
        : `Traffic patterns are within normal limits (below ${threshold} requests/minute)`
    };

    setDetectionResults(results);
  };

  // Add clear handler
  const handleClearDdosConfig = () => {
    setDdosConfig(defaultDdosConfig);
    setDetectionResults(null);
  };

  const securityAnalytics = useMemo(() => {
    const cacheKey = 'security_analytics_' + logData.length; // Update cache key
    const cachedAnalytics = getCachedData(cacheKey);
    
    if (cachedAnalytics) {
      return cachedAnalytics;
    }

    const analytics = {
      totalRequests: logData.length,
      suspiciousActivities: {
        total: 0,
        byType: {},
        timeline: Array(24).fill(0)
      },
      authenticationEvents: {
        success: 0,
        failure: 0,
        timeline: []
      },
      vulnerabilityScans: {
        detected: 0,
        blocked: 0,
        types: {}
      },
      geoSecurityEvents: {},
      rateLimit: {
        exceeded: 0,
        byIP: {}
      },
      maliciousPayloads: {
        detected: 0,
        types: {}
      }
    };

    logData.forEach(log => { // Use logData directly instead of filteredData
      const hour = new Date(log.timestamp).getHours();
      const statusCode = parseInt(log.statusCode);
      
      // Detect suspicious patterns
      if (statusCode === 401 || statusCode === 403) {
        analytics.authenticationEvents.failure++;
      }
      
      // Rate limiting analysis
      const ipKey = log.ip;
      if (!analytics.rateLimit.byIP[ipKey]) {
        analytics.rateLimit.byIP[ipKey] = {
          count: 0,
          timeline: {}
        };
      }
      analytics.rateLimit.byIP[ipKey].count++;

      // Vulnerability scan detection
      if (log.userAgent?.toLowerCase().includes('scanner') || 
          log.userAgent?.toLowerCase().includes('vulnerability')) {
        analytics.vulnerabilityScans.detected++;
      }

      // Malicious payload detection
      if (log.request?.toLowerCase().includes('script') || 
          log.request?.toLowerCase().includes('eval(')) {
        analytics.maliciousPayloads.detected++;
        analytics.maliciousPayloads.types['xss'] = 
          (analytics.maliciousPayloads.types['xss'] || 0) + 1;
      }

      // Geographic security events
      if (log.country) {
        analytics.geoSecurityEvents[log.country] = 
          (analytics.geoSecurityEvents[log.country] || 0) + 1;
      }
    });

    setCachedData(cacheKey, analytics);
    return analytics;
  }, [logData]); // Update dependency array

  // Add enhanced analytics processing
  const enhancedAnalytics = useMemo(() => {
    const ipStats = {};
    const timelineData = [];
    const methodStats = {};
    
    // Initialize timeline data
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(now.getHours() - i);
      timelineData.push({
        time: format(time, 'HH:mm'),
        authFailures: 0,
        suspiciousRequests: 0,
        maliciousPayloads: 0
      });
    }

    logData.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      const statusCode = parseInt(log.statusCode);
      
      // IP Statistics
      if (!ipStats[log.ip]) {
        ipStats[log.ip] = {
          address: log.ip,
          requests: 0,
          errors: 0,
          lastSeen: log.timestamp,
          methods: new Set()
        };
      }
      
      ipStats[log.ip].requests++;
      if (statusCode >= 400) ipStats[log.ip].errors++;
      ipStats[log.ip].methods.add(log.method);
      ipStats[log.ip].lastSeen = log.timestamp;

      // Timeline data
      const timeIndex = timelineData.findIndex(t => t.time === format(new Date(log.timestamp), 'HH:mm'));
      if (timeIndex !== -1) {
        if (statusCode === 401 || statusCode === 403) {
          timelineData[timeIndex].authFailures++;
        }
        if (log.userAgent?.toLowerCase().includes('scanner')) {
          timelineData[timeIndex].suspiciousRequests++;
        }
        if (log.request?.toLowerCase().includes('script')) {
          timelineData[timeIndex].maliciousPayloads++;
        }
      }

      // Method Statistics
      if (!methodStats[log.method]) {
        methodStats[log.method] = { method: log.method, total: 0, errors: 0, suspicious: 0 };
      }
      methodStats[log.method].total++;
      if (statusCode >= 400) methodStats[log.method].errors++;
      if (log.userAgent?.toLowerCase().includes('scanner') || 
          log.request?.toLowerCase().includes('script')) {
        methodStats[log.method].suspicious++;
      }
    });

    // Process IP stats for display
    const topIPs = Object.values(ipStats)
      .map(ip => ({
        ...ip,
        errorRate: ((ip.errors / ip.requests) * 100).toFixed(1),
        lastSeen: format(new Date(ip.lastSeen), 'HH:mm:ss'),
        suspicious: ip.errors / ip.requests > 0.2
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      topIPs,
      timelineData,
      methodStats: Object.values(methodStats)
    };
  }, [logData]);

  // Add bot detection analysis
  const botAnalytics = useMemo(() => {
    const cacheKey = 'bot_analytics_' + logData.length;
    const cachedAnalytics = getCachedData(cacheKey);
    
    if (cachedAnalytics) {
      return cachedAnalytics;
    }

    const knownCrawlers = [
      'googlebot', 'bingbot', 'yandexbot', 'baiduspider',
      'duckduckbot', 'slurp', 'crawler', 'spider'
    ];

    const maliciousPatterns = [
      'sqlmap', 'nikto', 'nmap', 'burp',
      'hydra', 'bot', 'scan', 'exploit'
    ];

    const botStats = {
      totalRequests: logData.length,
      totalBots: 0,
      knownCrawlers: 0,
      maliciousBots: 0,
      suspicious: 0,
      timeline: [],
      recentActivities: [],
      botsByIP: {}
    };

    // Initialize timeline
    const timeMap = {};
    logData.forEach(log => {
      const hour = format(new Date(log.timestamp), 'HH:mm');
      if (!timeMap[hour]) {
        timeMap[hour] = { time: hour, crawlers: 0, malicious: 0, suspicious: 0 };
      }

      const userAgent = log.userAgent?.toLowerCase() || '';
      const ip = log.ip;

      // Track requests per IP
      if (!botStats.botsByIP[ip]) {
        botStats.botsByIP[ip] = {
          requests: 0,
          userAgent,
          type: 'unknown',
          pattern: '',
          lastSeen: log.timestamp
        };
      }

      botStats.botsByIP[ip].requests++;
      botStats.botsByIP[ip].lastSeen = log.timestamp;

      // Detect bot type
      if (knownCrawlers.some(crawler => userAgent.includes(crawler))) {
        botStats.knownCrawlers++;
        timeMap[hour].crawlers++;
        botStats.botsByIP[ip].type = 'crawler';
        botStats.botsByIP[ip].pattern = 'Known crawler pattern';
      } else if (maliciousPatterns.some(pattern => userAgent.includes(pattern))) {
        botStats.maliciousBots++;
        timeMap[hour].malicious++;
        botStats.botsByIP[ip].type = 'malicious';
        botStats.botsByIP[ip].pattern = 'Malicious tool signature';
      } else if (
        botStats.botsByIP[ip].requests > 100 || // High request rate
        log.request?.toLowerCase().includes('wp-admin') || // WordPress scanning
        log.request?.toLowerCase().includes('phpmy') // phpMyAdmin attempts
      ) {
        botStats.suspicious++;
        timeMap[hour].suspicious++;
        botStats.botsByIP[ip].type = 'suspicious';
        botStats.botsByIP[ip].pattern = 'Abnormal behavior pattern';
      }
    });

    botStats.timeline = Object.values(timeMap);
    botStats.totalBots = botStats.knownCrawlers + botStats.maliciousBots + botStats.suspicious;

    // Get recent activities
    botStats.recentActivities = Object.entries(botStats.botsByIP)
      .filter(([, data]) => data.type !== 'unknown')
      .map(([ip, data]) => ({
        ip,
        userAgent: data.userAgent,
        type: data.type,
        requests: data.requests,
        lastSeen: format(new Date(data.lastSeen), 'HH:mm:ss'),
        pattern: data.pattern
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    setCachedData(cacheKey, botStats);
    return botStats;
  }, [logData]);

  // Calculate security stats
  const securityStats = useMemo(() => calculateSecurityStats(logData), [logData]);

  return (
    <div className="space-y-6">
      {/* Primary Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalyticsCard
          title="Total Requests"
          value={securityStats.totalRequests}
          trend={parseFloat(securityStats.requestTrend)}
          icon={FiBarChart2}
          color="text-blue-500"
          bgColor="bg-blue-50"
          subtitle="Last 24 hours"
        />
        <AnalyticsCard
          title="Unique IPs"
          value={securityStats.uniqueIPs.size}
          icon={FiHash}
          color="text-indigo-500"
          bgColor="bg-indigo-50"
          subtitle="Distinct sources"
        />
        <AnalyticsCard
          title="Attack Attempts"
          value={Object.values(securityStats.attackPatterns).reduce((a, b) => a + b, 0)}
          icon={FiAlertCircle}
          color="text-orange-500"
          bgColor="bg-orange-50"
          subtitle="Total detected"
        />
      </div>

      {/* Secondary Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticsCard
          title="Response Success Rate"
          value={`${((securityStats.responseStats.success / securityStats.totalRequests) * 100).toFixed(1)}%`}
          icon={FiZap}
          color="text-green-500"
          bgColor="bg-green-50"
          subtitle="200-299 responses"
        />
        <AnalyticsCard
          title="Client Errors"
          value={securityStats.responseStats.clientError}
          icon={FiGitCommit}
          color="text-yellow-500"
          bgColor="bg-yellow-50"
          subtitle="400-499 responses"
        />
        <AnalyticsCard
          title="Server Errors"
          value={securityStats.responseStats.serverError}
          icon={FiRepeat}
          color="text-red-500"
          bgColor="bg-red-50"
          subtitle="500+ responses"
        />
      </div>

      {/* Existing DDoS Configuration */}
      <DDoSDetectionConfig
        config={ddosConfig}
        onConfigChange={setDdosConfig}
        onAnalyze={analyzeDDoS}
        detectionResults={detectionResults}
        onClear={handleClearDdosConfig}
      />

      {/* Attack Pattern Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityMetricsChart data={enhancedAnalytics.timelineData} />
        <RequestMethodsSecurityChart data={enhancedAnalytics.methodStats} />
      </div>

      {/* Enhanced IP Analysis */}
      <TopIPsTable data={enhancedAnalytics.topIPs} />

      {/* Bot Activity Analysis */}
      <EnhancedBotDetectionPanel botData={botAnalytics} />
    </div>
  );
};

// Security Card Component
const SecurityCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className={`${bgColor} p-6 rounded-xl`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-semibold ${color} mt-1`}>{value}</p>
      </div>
      <div className={`${color} p-3 rounded-full ${bgColor}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default SecurityDashboard;