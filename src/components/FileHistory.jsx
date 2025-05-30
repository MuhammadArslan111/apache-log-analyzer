// Adding necessary React hooks and components
import React, { useState } from 'react';
// Adding date formatting utility
import { formatDistanceToNow } from 'date-fns';
// Adding icons for UI elements
import { FiClock, FiRefreshCw, FiTrash2, FiFilter, FiFile, FiChevronDown } from 'react-icons/fi';
// Adding FileHistory component for displaying and managing processed files
const FileHistory = ({ files, onProcess, onDelete }) => {
  // Adding state management for sorting preferences
  const [sortBy, setSortBy] = useState('date');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Adding file sorting logic
  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'date') {
      const timeA = a.split('_')[1].split('.')[0];
      const timeB = b.split('_')[1].split('.')[0];
      return timeB - timeA;
    }
    return a.localeCompare(b);
  });

  // Adding main component render structure
  return (
    <div className="max-w-3xl mx-auto mb-8">
      {/* Adding main container with white background */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Adding header section with title and sort controls */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* Adding title and description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Recent Files</h2>
              <p className="text-sm text-gray-500 mt-1">
                Previously processed log files
              </p>
            </div>
            {/* Adding sort dropdown control */}
            <div className="relative">
              {/* Adding sort button trigger */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <FiFilter className="text-gray-400 w-4 h-4" />
                <span className="text-sm text-gray-600">
                  {sortBy === 'date' ? 'Sort by Date' : 'Sort by Name'}
                </span>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {/* Adding sort options dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  {/* Adding date sort option */}
                  <button
                    onClick={() => {
                      setSortBy('date');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150
                      ${sortBy === 'date' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                  >
                    Sort by Date
                  </button>
                  {/* Adding name sort option */}
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150
                      ${sortBy === 'name' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                  >
                    Sort by Name
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Adding file list section */}
        <div className="divide-y divide-gray-50">
          {/* Adding empty state display */}
          {files.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-gray-50 rounded-full">
                  <FiFile className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No files uploaded yet</p>
                <p className="text-sm text-gray-400">
                  Upload a log file to get started
                </p>
              </div>
            </div>
          ) : (
            // Adding file list items
            sortedFiles.map((file) => {
              // Adding time ago calculation
              const timestamp = parseInt(file.split('_')[1]);
              const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
              
              // Adding individual file item
              return (
                <div 
                  key={file} 
                  className="p-4 hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    {/* Adding file information display */}
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm border border-gray-100">
                        <FiFile className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file}</p>
                        <div className="flex items-center mt-1.5 text-xs text-gray-500">
                          <FiClock className="w-3 h-3 mr-1" />
                          {timeAgo}
                        </div>
                      </div>
                    </div>
                    {/* Adding action buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Adding reprocess button */}
                      <button
                        onClick={() => onProcess(file)}
                        className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-100"
                      >
                        <FiRefreshCw className="w-4 h-4 mr-1.5" />
                        Reprocess
                      </button>
                      {/* Adding delete button */}
                      <button
                        onClick={() => onDelete(file)}
                        className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                      >
                        <FiTrash2 className="w-4 h-4 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
// Adding component export
export default FileHistory; 