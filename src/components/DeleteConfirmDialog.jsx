// Adding React library for component creation
import React from 'react';
// Adding DeleteConfirmDialog component for file deletion confirmation
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, filename }) => {
  // Adding conditional render check for dialog visibility
  if (!isOpen) return null;

  // Adding main dialog render structure
  return (
    // Adding overlay container with semi-transparent background
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Adding dialog content container with white background */}
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Adding dialog header */}
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        {/* Adding confirmation message with dynamic filename */}
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{filename}"? This action cannot be undone.
        </p>
        {/* Adding action buttons container */}
        <div className="flex justify-end space-x-3">
          {/* Adding cancel button */}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          {/* Adding delete confirmation button */}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Adding component export
export default DeleteConfirmDialog; 