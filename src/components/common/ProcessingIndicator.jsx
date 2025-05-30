//  Core React functionality
import React from 'react';
//  Feather icons for visual indicators
import { FiLoader, FiCheckCircle, FiCpu } from 'react-icons/fi';

//  Processing steps configuration array for tracking analysis progress
const ProcessingSteps = [
  { id: 'init', title: 'Initializing', description: 'Preparing log analysis engine' },
  { id: 'parse', title: 'Parsing', description: 'Reading and validating log entries' },
  { id: 'analyze', title: 'Analyzing', description: 'Processing log patterns' },
  { id: 'geo', title: 'Geo Processing', description: 'Mapping IP addresses' },
  { id: 'complete', title: 'Completing', description: 'Finalizing results' }
];

//  ProcessingIndicator Component - Displays analysis progress and statistics
const ProcessingIndicator = ({ progress, currentStep = 'parse', stats = {} }) => {
  //  Helper function to get current step index
  const getCurrentStepIndex = () => {
    return ProcessingSteps.findIndex(step => step.id === currentStep);
  };

  //  Helper function to determine step status (complete, active, pending)
  const getStepStatus = (stepIndex) => {
    const currentIndex = getCurrentStepIndex();
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    //  Modal overlay with blur effect
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      {/*  Main content container */}
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-8">
        {/*  Header section with icon and title */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-50 rounded-lg">
            <FiCpu className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Processing Log File
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please wait while we analyze your log data
            </p>
          </div>
        </div>

        {/*  Progress bar section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Overall Progress
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/*  Processing steps list with status indicators */}
        <div className="space-y-4">
          {ProcessingSteps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div 
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-colors
                  ${status === 'active' ? 'bg-blue-50' : 'bg-gray-50'}
                `}
              >
                {/*  Dynamic status icon based on step state */}
                <div className="mt-1">
                  {status === 'complete' && (
                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {status === 'active' && (
                    <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {status === 'pending' && (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                
                {/*  Step information with dynamic styling */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${
                      status === 'active' ? 'text-blue-700' :
                      status === 'complete' ? 'text-gray-700' :
                      'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    {stats[step.id] && (
                      <span className="text-sm text-gray-500">
                        {stats[step.id]}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${
                    status === 'active' ? 'text-blue-600' :
                    status === 'complete' ? 'text-gray-600' :
                    'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/*  Step-specific statistics */}
        {stats.summary && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              {/*  Processed lines statistics */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Processed Lines</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {stats.summary.lines.toLocaleString()}
                </p>
              </div>
              {/*  Valid entries statistics */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Valid Entries</p>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {stats.summary.valid.toLocaleString()}
                </p>
              </div>
              {/*  Invalid entries statistics */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Invalid Entries</p>
                <p className="text-lg font-semibold text-red-600 mt-1">
                  {stats.summary.invalid.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//  Export ProcessingIndicator component for use in log analysis workflow
export default ProcessingIndicator; 