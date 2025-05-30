//  Required React hooks for state and callback management
import React, { useCallback, useState } from 'react';
//  File drag and drop functionality from react-dropzone
import { useDropzone } from 'react-dropzone';
//  Feather icons for visual elements
import { 
  FiUploadCloud, FiFile, FiX, 
  FiClock, FiInfo 
} from 'react-icons/fi';

//  DropZone Component - Handles file upload interactions and validations
const DropZone = ({ onFileUpload, onHistoryClick }) => {
  //  State management for file upload process
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragReject, setIsDragReject] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);

  //  File validation function to check file type and size
  const validateFile = (file) => {
    if (!file) return false;
    if (!file.name.toLowerCase().endsWith('.log')) {
      setError('Only .log files are allowed');
      return false;
    }
    if (file.size > 1024 * 1024 * 1024) {
      setError('File size must be less than 1GB');
      return false;
    }
    return true;
  };

  //  File drop handler with validation and status updates
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    
    //  Handle rejected files with error feedback
    if (rejectedFiles.length > 0) {
      setIsDragReject(true);
      setUploadStatus('error');
      setError('Invalid file type. Please use .log files only');
      setTimeout(() => {
        setIsDragReject(false);
        setUploadStatus(null);
      }, 2000);
      return;
    }

    //  Process accepted file with validation
    const file = acceptedFiles[0];
    if (!validateFile(file)) {
      setIsDragReject(true);
      setUploadStatus('error');
      setTimeout(() => {
        setIsDragReject(false);
        setUploadStatus(null);
      }, 2000);
      return;
    }

    //  Set file and trigger upload process
    setSelectedFile(file);
    setUploadStatus('ready');
    const event = { target: { files: [file] } };
    onFileUpload(event);
  }, [onFileUpload]);

  //  Configure dropzone with file type restrictions and validators
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.log'] },
    multiple: false,
    maxSize: 1024 * 1024 * 1024,
    validator: (file) => {
      if (!file.name.toLowerCase().endsWith('.log')) {
        return {
          code: 'file-invalid-type',
          message: 'Only .log files are allowed'
        };
      }
      return null;
    }
  });

  //  Component UI render
  return (
    <div className="max-w-4xl mx-auto w-full">
      {/*  Header Section with title and history button */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Upload Log File
          </h2>
          <p className="mt-2 text-gray-500">
            Analyze and visualize your server logs with advanced analytics
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onHistoryClick();
          }}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all shadow-sm"
        >
          <FiClock className="w-5 h-5" />
          <span>View History</span>
        </button>
      </div>

      {/*  Main Upload Area with drag and drop zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/*  Upload dropzone with visual feedback */}
        <div className="p-8">
          <div
            {...getRootProps()}
            className={`
              relative p-12 border-2 border-dashed rounded-xl transition-all duration-300
              ${isDragActive ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'}
              ${isDragReject ? 'border-red-300 bg-red-50/30' : ''}
              hover:border-blue-300 group
            `}
          >
            <input {...getInputProps()} />
            
            {/* Upload Icon & Text */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className={`
                p-6 rounded-full transition-all duration-300 group-hover:scale-110
                ${isDragActive ? 'bg-blue-100/50' : 'bg-gray-50'}
                ${isDragReject ? 'bg-red-100/50' : ''}
              `}>
                <FiUploadCloud className={`
                  w-14 h-14 transition-colors duration-300
                  ${isDragActive ? 'text-blue-500' : 'text-gray-400'}
                  ${isDragReject ? 'text-red-400' : ''}
                `} />
              </div>
              
              <div className="text-center space-y-3 max-w-sm">
                <p className={`
                  text-lg font-medium transition-colors duration-300
                  ${isDragActive ? 'text-blue-600' : 'text-gray-700'}
                  ${isDragReject ? 'text-red-500' : ''}
                `}>
                  {isDragReject 
                    ? 'Invalid file type. Please use .log files only'
                    : isDragActive 
                      ? 'Drop your log file here'
                      : 'Drag & drop your log file here'
                  }
                </p>
                {!isDragActive && !isDragReject && (
                  <p className="text-sm text-gray-500">
                    or click to browse from your computer
                  </p>
                )}
              </div>
            </div>
          </div>

          {/*  File Requirements Information */}
          <div className="mt-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FiInfo className="w-4 h-4" />
              <span>Accepted file types: .log (up to 1GB)</span>
            </div>
          </div>
        </div>

        {/*  Selected File Preview Section */}
        {selectedFile && (
          <div className="border-t border-gray-100">
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <FiFile className={`w-6 h-6 ${error ? 'text-red-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {error && (
                      <p className="text-xs text-red-500 mt-1">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {uploadStatus === 'ready' && !error && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                      Ready to process
                    </span>
                  )}
                  {error && (
                    <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                      Invalid file
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadStatus(null);
                      setError(null);
                    }}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    aria-label="Remove file"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              {uploadStatus === 'ready' && !error && (
                <div className="mt-1 h-1 bg-blue-400/30">
                  <div className="h-full w-full bg-blue-500 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

//  Export component for use in other parts of the application
export default DropZone; 