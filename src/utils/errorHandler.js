import { toast } from 'react-toastify';

// Error types
export const ERROR_TYPES = {
  FILE: 'FILE_ERROR',
  NETWORK: 'NETWORK_ERROR',
  PROCESSING: 'PROCESSING_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.FILE]: {
    title: 'File Error',
    message: 'There was an error processing your file'
  },
  [ERROR_TYPES.NETWORK]: {
    title: 'Network Error',
    message: 'Unable to connect to the server'
  },
  [ERROR_TYPES.PROCESSING]: {
    title: 'Processing Error',
    message: 'Error processing data'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Validation Error',
    message: 'Invalid data format'
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Server Error',
    message: 'Server encountered an error'
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred'
  }
};

// Custom error class
export class AppError extends Error {
  constructor(type, message, details = null) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date();
  }
}

// Error handler function
export const handleError = (error, customMessage = null) => {
  console.error('Error:', error);

  const errorType = error.type || ERROR_TYPES.UNKNOWN;
  const errorInfo = ERROR_MESSAGES[errorType];

  // Show toast notification
  toast.error(
    <div>
      <h4 className="font-bold">{errorInfo.title}</h4>
      <p>{customMessage || errorInfo.message}</p>
      {error.details && (
        <p className="text-sm text-gray-500 mt-1">{error.details}</p>
      )}
    </div>,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    }
  );

  // Log error to monitoring service 
  logError(error);

  return error;
};

// Log error to monitoring service
const logError = (error) => {
  // Implement error logging
  console.log('Error logged:', {
    type: error.type,
    message: error.message,
    details: error.details,
    timestamp: error.timestamp,
    stack: error.stack
  });
}; 