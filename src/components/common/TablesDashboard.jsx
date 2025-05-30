//  Required React hooks for state management and memoization
import React, { useState, useMemo, useEffect } from 'react';
//  Feather icons for UI elements
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiSettings, FiChevronDown, FiList, FiX } from 'react-icons/fi';
//  Date formatting utility
import { formatDistanceToNow } from 'date-fns';

//  Page size options for entries per page dropdown
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250, 500];

//  TablesDashboard Component - Advanced data table with sorting, filtering, and pagination
const TablesDashboard = ({ data, onExport }) => {
  //  State management for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  //  State management for settings panel
  const [showSettings, setShowSettings] = useState(false);
  //  State management for table configuration
  const [tableSettings, setTableSettings] = useState({
    showRowNumbers: true,
    densePadding: false,
    highlightOnHover: true,
    alternateRowColors: true,
    showTimestampRelative: false,
    visibleColumns: {
      timestamp: true,
      ip: true,
      method: true,
      path: true,
      statusCode: true,
      userAgent: false,
      bytes: false
    }
  });

  //  State for entries dropdown visibility
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);

  //  Pagination calculations
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  //  Helper functions
  // ...existing getVisiblePageNumbers function...
  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  //  Page numbers calculation with memoization
  const pageNumbers = useMemo(() => getVisiblePageNumbers(), [currentPage, totalPages]);

  //  Page navigation handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  //  Page size change handler
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  //  Status color mapping function
  const getStatusColor = (status) => {
    if (status >= 500) return 'text-red-600 bg-red-50';
    if (status >= 400) return 'text-orange-600 bg-orange-50';
    if (status >= 300) return 'text-blue-600 bg-blue-50';
    if (status >= 200) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

   //  HTTP method color mapping function
  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-blue-600 bg-blue-50',
      POST: 'text-green-600 bg-green-50',
      PUT: 'text-orange-600 bg-orange-50',
      DELETE: 'text-red-600 bg-red-50',
      PATCH: 'text-purple-600 bg-purple-50'
    };
    return colors[method] || 'text-gray-600 bg-gray-50';
  };

  //  Timestamp formatting function
  const formatTimestamp = (timestamp) => {
    if (tableSettings.showTimestampRelative) {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    }
    return new Date(timestamp).toLocaleString();
  };

  //  Column definitions with formatters
  const columns = [
    { id: 'timestamp', label: 'Timestamp', format: (value) => formatTimestamp(value) },
    { id: 'ip', label: 'IP Address' },
    { id: 'method', label: 'Method', format: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(value)}`}>
        {value}
      </span>
    )},
    { id: 'path', label: 'Path' },
    { id: 'statusCode', label: 'Status', format: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
        {value}
      </span>
    )},
    { id: 'userAgent', label: 'User Agent' },
    { id: 'bytes', label: 'Size', format: (value) => formatBytes(value) }
  ];

  //  Filter visible columns based on settings
  const visibleColumns = columns.filter(col => tableSettings.visibleColumns[col.id]);

  //  Byte size formatting function
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Settings Panel Component
  const SettingsPanel = () => (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-10">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700">Table Settings</h4>
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Display Settings */}
        <div>
          <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Display</h5>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tableSettings.showRowNumbers}
                onChange={(e) => setTableSettings(prev => ({
                  ...prev,
                  showRowNumbers: e.target.checked
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Show row numbers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tableSettings.densePadding}
                onChange={(e) => setTableSettings(prev => ({
                  ...prev,
                  densePadding: e.target.checked
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Compact view</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tableSettings.highlightOnHover}
                onChange={(e) => setTableSettings(prev => ({
                  ...prev,
                  highlightOnHover: e.target.checked
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Highlight on hover</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tableSettings.alternateRowColors}
                onChange={(e) => setTableSettings(prev => ({
                  ...prev,
                  alternateRowColors: e.target.checked
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Alternate row colors</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tableSettings.showTimestampRelative}
                onChange={(e) => setTableSettings(prev => ({
                  ...prev,
                  showTimestampRelative: e.target.checked
                }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Relative timestamps</span>
            </label>
          </div>
        </div>

        {/* Visible Columns */}
        <div>
          <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Visible Columns</h5>
          <div className="space-y-2">
            {columns.map(column => (
              <label key={column.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tableSettings.visibleColumns[column.id]}
                  onChange={(e) => setTableSettings(prev => ({
                    ...prev,
                    visibleColumns: {
                      ...prev.visibleColumns,
                      [column.id]: e.target.checked
                    }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{column.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  //  this component for the enhanced dropdown
  const EntriesPerPageDropdown = () => (
    <div className="relative inline-block">
      <button
        onClick={() => setShowEntriesDropdown(!showEntriesDropdown)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <FiList className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{pageSize} entries</span>
        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showEntriesDropdown ? 'transform rotate-180' : ''}`} />
      </button>

      {showEntriesDropdown && (
        <div className="absolute mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10">
          <div className="max-h-64 overflow-y-auto">
            {PAGE_SIZE_OPTIONS.map(size => (
              <button
                key={size}
                onClick={() => {
                  handlePageSizeChange(size);
                  setShowEntriesDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50
                  ${pageSize === size ? 'text-blue-600 bg-blue-50/50 font-medium' : 'text-gray-600'}
                `}
              >
                {size === pageSize ? (
                  <div className="flex items-center justify-between">
                    <span>{size} entries</span>
                    <span className="text-blue-600">✓</span>
                  </div>
                ) : (
                  <span>{size} entries</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  //  Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEntriesDropdown && !event.target.closest('.entries-dropdown')) {
        setShowEntriesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEntriesDropdown]);

  //  Export functionality helpers
  const exportToCSV = () => {
    const headers = visibleColumns.map(col => col.label).join(',');
    const rows = data.map(row => 
      visibleColumns.map(col => {
        const value = row[col.id];
        // Handle values that might contain commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    downloadFile(csv, 'log_entries.csv', 'text/csv');
  };

  const exportToJSON = () => {
    const filteredData = data.map(row => {
      const filtered = {};
      visibleColumns.forEach(col => {
        filtered[col.id] = row[col.id];
      });
      return filtered;
    });
    
    const json = JSON.stringify(filteredData, null, 2);
    downloadFile(json, 'log_entries.json', 'application/json');
  };

  const downloadFile = (content, fileName, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Log Entries Table */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Log Entries</h3>
          <div className="space-x-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Table Controls */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {endIndex} of {data.length} entries
            </div>
            
            <div className="entries-dropdown">
              <EntriesPerPageDropdown />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search input here */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiSettings className="w-5 h-5 text-gray-500" />
              </button>

              {showSettings && <SettingsPanel />}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableSettings.showRowNumbers && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                )}
                {visibleColumns.map(column => (
                  <th
                    key={column.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(startIndex, endIndex).map((log, index) => (
                <tr
                  key={index}
                  className={`
                    ${tableSettings.highlightOnHover ? 'hover:bg-gray-50' : ''}
                    ${tableSettings.alternateRowColors && index % 2 ? 'bg-gray-50' : ''}
                    ${tableSettings.densePadding ? 'h-10' : 'h-14'}
                    transition-colors duration-150
                  `}
                >
                  {tableSettings.showRowNumbers && (
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      {startIndex + index + 1}
                    </td>
                  )}
                  {visibleColumns.map(column => (
                    <td
                      key={column.id}
                      className={`px-6 ${tableSettings.densePadding ? 'py-2' : 'py-4'} whitespace-nowrap text-sm`}
                    >
                      {column.format ? column.format(log[column.id]) : log[column.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination Controls */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronsLeft className="w-5 h-5" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {pageNumbers.map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    pageNum === currentPage
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : pageNum === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronRight className="w-5 h-5" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronsRight className="w-5 h-5" />
            </button>
          </div>

          {/* Direct Page Input */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Go to page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

//  Export TablesDashboard component for use in main application
export default TablesDashboard;