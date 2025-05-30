//  Required React hooks for component state and lifecycle management
import React, { useState, useEffect } from 'react';
//  Cache utility functions for managing cache operations
import { getCacheStats, clearCache } from '../../utils/cache';
//  Feather icons for visual representation of cache metrics
import { FiRefreshCw, FiTrash2, FiDatabase, FiClock, FiZap, FiServer, FiPieChart } from 'react-icons/fi';

//  CacheMonitor Component - Displays real-time cache statistics and controls
const CacheMonitor = () => {
  //  State for storing cache statistics
  const [stats, setStats] = useState(null);
  //  Refresh key to trigger cache stats updates
  const [refreshKey, setRefreshKey] = useState(0);

  //  Effect hook to handle real-time cache statistics updates
  useEffect(() => {
    //  Function to fetch and update cache statistics
    const updateStats = () => {
      setStats(getCacheStats());
    };

    //  Initial stats update and setting up polling interval
    updateStats();
    const interval = setInterval(updateStats, 5000); // Updates every 5 seconds

    //  Cleanup function to clear interval on component unmount
    return () => clearInterval(interval);
  }, [refreshKey]);

  //  Handler function to clear cache and trigger stats refresh
  const handleClearCache = () => {
    clearCache();
    setRefreshKey(prev => prev + 1);
  };

  //  Early return if stats are not yet loaded
  if (!stats) return null;

  //  Component UI render
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/*  Header section with title and control buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FiDatabase className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Cache Status</h3>
        </div>
        {/*  Control buttons for refresh and cache clear */}
        <div className="flex space-x-2">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh Stats"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleClearCache}
            className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            title="Clear Cache"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/*  Grid layout for cache metrics display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/*  Cache Size Metric Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FiServer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-600">CACHE SIZE</span>
          </div>
          <div className="mt-2">
            <h4 className="text-2xl font-bold text-blue-700">{stats.size}</h4>
            <p className="text-sm text-blue-600">Cached Items</p>
          </div>
        </div>

        {/*  Hit Rate Metric Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">HIT RATE</span>
          </div>
          <div className="mt-2">
            <h4 className="text-2xl font-bold text-green-700">{stats.hitRate}</h4>
            <p className="text-sm text-green-600">Cache Efficiency</p>
          </div>
        </div>

        {/*  Total Requests Metric Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <FiPieChart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-600">REQUESTS</span>
          </div>
          <div className="mt-2">
            <h4 className="text-2xl font-bold text-purple-700">{stats.totalRequests}</h4>
            <p className="text-sm text-purple-600">Total Cache Requests</p>
          </div>
        </div>

        {/*  Last Cleanup Metric Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <FiClock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-amber-600">LAST CLEANUP</span>
          </div>
          <div className="mt-2">
            <h4 className="text-sm font-bold text-amber-700">
              {new Date(stats.lastCleanup).toLocaleTimeString()}
            </h4>
            <p className="text-sm text-amber-600">Auto-cleanup Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

//  Export component for use in other parts of the application
export default CacheMonitor; 