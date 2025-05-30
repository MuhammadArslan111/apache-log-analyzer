//  Core React functionality
import React from 'react';

//  MalformedLogsPopup Component - Displays invalid log entries in a modal
const MalformedLogsPopup = ({ malformedLogs, onClose }) => {
  return (
    //  Modal overlay with semi-transparent background
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      {/*  Modal container with maximum dimensions and scrolling */}
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/*  Modal header with title and close button */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Malformed Log Entries</h2>
            {/*  Counter for invalid entries */}
            <p className="text-sm text-gray-500">
              Found {malformedLogs.length} invalid log entries
            </p>
          </div>
          {/*  Close button with X icon */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/*  Scrollable content area for log entries */}
        <div className="p-6 overflow-auto">
          <div className="space-y-4">
            {/*  Map through malformed logs and display each entry */}
            {malformedLogs.map((log, index) => (
              <div key={index} className="bg-red-50 rounded-lg p-4">
                {/*  Log entry header with line number and type */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/*  Line number indicator */}
                    <p className="text-sm font-medium text-red-800">
                      Line {log.lineNumber}
                    </p>
                    {/*  Error message display */}
                    <p className="mt-1 text-sm text-red-600">
                      Error: {log.error}
                    </p>
                  </div>
                  {/*  Error type badge */}
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {log.type}
                  </span>
                </div>
                {/*  Raw log content in pre-formatted block */}
                <div className="mt-2">
                  <pre className="text-xs bg-white p-2 rounded border border-red-100 overflow-x-auto">
                    {log.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  Modal footer with information and close button */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            {/*  Informational text about excluded entries */}
            <p className="text-sm text-gray-500">
              These entries were excluded from the analysis
            </p>
            {/*  Secondary close button for better UX */}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

//  Export MalformedLogsPopup component for use in log analysis interface
export default MalformedLogsPopup; 