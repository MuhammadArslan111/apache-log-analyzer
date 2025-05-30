//  Required React hooks for state and side effects
import React, { useState, useRef, useEffect } from 'react';
//  Feather icons for visual elements
import { FiClock, FiFilter, FiChevronDown, FiList, FiGrid, FiX, FiFile, FiPlay, FiTrash2 } from 'react-icons/fi';
//  Date formatting utility from date-fns
import { formatDistanceToNow } from 'date-fns';

//  Sidebar Component - Displays file history and management options
const Sidebar = ({ files, onProcess, onDelete, isOpen, onClose }) => {
  //  State management for sorting and view preferences
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  //  Reference for handling outside clicks
  const sidebarRef = useRef(null);

  //  Effect hook for handling clicks outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    //  Add event listener when sidebar is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    //  Cleanup event listener on unmount or state change
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  //  Effect hook for handling escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    //  Add event listener when sidebar is open
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    //  Cleanup event listener on unmount or state change
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  //  Sort files based on selected sorting criteria
  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'date') {
      const timeA = a.split('_')[1].split('.')[0];
      const timeB = b.split('_')[1].split('.')[0];
      return timeB - timeA;
    }
    return a.localeCompare(b);
  });

  return (
    <>
      {/*  Semi-transparent overlay when sidebar is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
      )}
      
      {/*  Main sidebar container with slide animation */}
      <div 
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">File History</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/*  Control section for sorting and view options */}
        <div className="p-4 border-b border-gray-100">
          {/*  Sort and view mode controls container */}
          <div className="flex items-center justify-between mb-4">
            {/*  Sort dropdown control */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiFilter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {sortBy === 'date' ? 'Sort by Date' : 'Sort by Name'}
                </span>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={() => {
                      setSortBy('date');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === 'date' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                  >
                    Sort by Date
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === 'name' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                  >
                    Sort by Name
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/*  Scrollable file list container */}
        <div className="overflow-y-auto h-[calc(100vh-8.5rem)]">
          {/*  Empty state display when no files exist */}
          {sortedFiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiClock className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            /*  File list with conditional rendering based on view mode */
            <div className={viewMode === 'list' ? 'divide-y divide-gray-100' : 'p-4 grid grid-cols-2 gap-4'}>
              {/*  Map through sorted files and render based on view mode */}
              {sortedFiles.map((file) => {
                const timestamp = parseInt(file.split('_')[1]);
                const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
                
                //  Conditional rendering for list/grid view
                return viewMode === 'list' ? (
                  /*  List view file item */
                  <div key={file} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FiFile className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700 truncate pr-2">
                            {file}
                          </p>
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {timeAgo}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => onProcess(file)}
                            className="text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1"
                          >
                            <FiPlay className="w-3 h-3" />
                            <span>Process</span>
                          </button>
                          <button
                            onClick={() => onDelete(file)}
                            className="text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1"
                          >
                            <FiTrash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /*  Grid view file item */
                  <div key={file} className="p-4 border border-gray-100 rounded-lg hover:border-blue-500/50 transition-all">
                    <p className="text-sm font-medium text-gray-700 truncate">{file}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => onProcess(file)}
                        className="flex-1 text-xs text-blue-600 hover:bg-blue-50 py-1.5 rounded"
                      >
                        Process
                      </button>
                      <button
                        onClick={() => onDelete(file)}
                        className="flex-1 text-xs text-red-600 hover:bg-red-50 py-1.5 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

//  Export Sidebar component for use in main application layout
export default Sidebar; 