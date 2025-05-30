//  Core React functionality
import React from 'react';
//  Alert triangle icon for warning visual
import { FiAlertTriangle } from 'react-icons/fi';

//  RefreshConfirmDialog Component - Confirmation modal for application refresh
const RefreshConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
  //  Early return if dialog is not open
  if (!isOpen) return null;

  return (
    //  Modal overlay with semi-transparent background
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
      {/*  Modal content container */}
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/*  Header section with warning icon and title */}
        <div className="flex items-center mb-4">
          <FiAlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Confirm Refresh</h3>
        </div>
        
        {/*  Warning message about data loss */}
        <p className="text-gray-600 mb-6">
          This will clear all cached data and reload the application. Any unsaved changes will be lost. Are you sure you want to continue?
        </p>
        
        {/*  Action buttons container */}
        <div className="flex justify-end space-x-3">
          {/*  Cancel button with hover effects */}
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          {/*  Confirm button with primary styling */}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

//  Export RefreshConfirmDialog component for use in application refresh flow
export default RefreshConfirmDialog; 