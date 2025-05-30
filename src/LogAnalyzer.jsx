// Adding necessary React hooks and components
import React, { useState, useEffect } from 'react';
// Adding toast notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Adding component imports
import Header from './components/common/Header';
import FilterSection from './components/filters/FilterSection';
import ProcessingIndicator from './components/common/ProcessingIndicator';
import DropZone from './components/common/DropZone';
import TablesDashboard from './components/common/TablesDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
// Adding utility functions
import { filterLogs } from './utils/logProcessing';
import { handleError, ERROR_TYPES, AppError } from './utils/errorHandler.jsx';
// Adding feature components
import Dashboard from './components/dashboard/Dashboard';
import MalformedLogsPopup from './components/common/MalformedLogsPopup';
import { StreamParser } from './utils/streamParser';
// Adding HTTP client
import axios from 'axios';
// Adding UI components
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import Sidebar from './components/common/Sidebar';
import ComparisonGraphs from './components/analysis/ComparisonGraphs';
import CacheMonitor from './components/common/CacheMonitor';
import SecurityDashboard from './components/security/SecurityDashboard';
// Adding main LogAnalyzer component
function LogAnalyzer() {
  // Adding state management for log data
  const [logData, setLogData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // Adding processing state management
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  // Adding filter state management
  const [searchFilters, setSearchFilters] = useState({
    startTime: '',
    endTime: '',
    ip: '',
    statusCode: ''
  });
  // Adding UI state management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [malformedLogs, setMalformedLogs] = useState([]);
  const [showMalformedPopup, setShowMalformedPopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, filename: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Adding processing statistics state
  const [processingStats, setProcessingStats] = useState({
    currentStep: 'init',
    summary: null,
    parse: null,
    analyze: null,
    geo: null
  });

  // Adding file size validation constant
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

  // Adding file history loader effect
  useEffect(() => {
    loadFileHistory();
  }, []);

  // Adding file history loading function
  const loadFileHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/files');
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error loading file history:', error);
    }
  };

  // Adding file deletion handler
  const handleDeleteFile = async (filename) => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`/api/files/${filename}`);
      
      if (response.data.success) {
        // Update file list
        setUploadedFiles(prev => prev.filter(f => f !== filename));
        toast.success('File deleted successfully');
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(error.response?.data?.error || 'Failed to delete file');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Adding delete confirmation handler
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/files/${deleteDialog.filename}`);
      await loadFileHistory();
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      handleError(error);
    } finally {
      setDeleteDialog({ isOpen: false, filename: null });
    }
  };

  // Adding chunk upload handler
  const uploadChunk = async (chunk, filename, chunkIndex) => {
    const formData = new FormData();
    formData.append('logFile', chunk, filename);
    formData.append('chunkIndex', chunkIndex);
    
    try {
      await axios.post('http://localhost:3001/api/upload', formData);
    } catch (error) {
      throw new Error(`Failed to upload chunk ${chunkIndex}: ${error.message}`);
    }
  };

  // Adding file upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    try {
      if (!file) {
        throw new AppError(
          ERROR_TYPES.VALIDATION,
          'No file selected',
          'Please select a log file'
        );
      }

      // File validation
      if (!file || !file.name.endsWith('.log')) {
        throw new AppError(
          ERROR_TYPES.VALIDATION,
          'Invalid file',
          'Please select a valid .log file'
        );
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new AppError(
          ERROR_TYPES.VALIDATION,
          'File too large',
          `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        );
      }

      setIsProcessing(true);
      setProcessProgress(0);

      const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
      const chunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < chunks; i++) {
        const chunk = file.slice(
          i * CHUNK_SIZE,
          Math.min((i + 1) * CHUNK_SIZE, file.size)
        );
        await uploadChunk(chunk, file.name, i);
        handleProgress((i + 1) / chunks * 100);
      }

      // Get the uploaded file path
      const response = await axios.get('http://localhost:3001/api/files');
      setUploadedFiles(response.data);

      // Process the most recently uploaded file
      if (response.data && response.data.length > 0) {
        const latestFile = response.data[response.data.length - 1];
        await processLogFile(latestFile);
      }

      toast.success('File uploaded and processed successfully');
    } catch (error) {
      console.error('File upload error:', error);
      handleError(error);
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  // Adding progress update handler
  const handleProgress = (progress) => {
    setProcessProgress(progress);
  };

  // Adding search functionality
  const handleSearch = () => {
    const filtered = filterLogs(logData, searchFilters);
    setFilteredData(filtered);
  };

  // Adding export functionality
  const handleExport = (format) => {
    const dataToExport = filteredData.length > 0 ? filteredData : logData;
    const content = format === 'csv' 
      ? convertToCSV(dataToExport)
      : JSON.stringify(dataToExport, null, 2);
    
    const blob = new Blob([content], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log_analysis.${format}`;
    a.click();
  };

  // Adding log file processing handler
  const processLogFile = async (filename) => {
    try {
      setIsProcessing(true);
      setProcessingStats({
        currentStep: 'init',
        summary: null
      });

      const response = await axios.get(`http://localhost:3001/uploads/${filename}`, {
        responseType: 'text'
      });

      setProcessingStats(prev => ({
        ...prev,
        currentStep: 'parse'
      }));

      const parser = new StreamParser(8 * 1024);
      const { validLines, malformedLines } = await parser.parseFile(
        new File([response.data], filename, { type: 'text/plain' }),
        (progress) => {
          setProcessProgress(progress);
          setProcessingStats(prev => ({
            ...prev,
            parse: `${progress.toFixed(0)}% complete`
          }));
        }
      );

      setProcessingStats(prev => ({
        ...prev,
        currentStep: 'analyze',
        analyze: 'Processing patterns'
      }));

      // Set the processed data
      setLogData(validLines);
      setFilteredData(validLines);
      setMalformedLogs(malformedLines);

      setProcessingStats(prev => ({
        ...prev,
        currentStep: 'complete',
        summary: {
          lines: validLines.length + malformedLines.length,
          valid: validLines.length,
          invalid: malformedLines.length
        }
      }));

      if (malformedLines.length > 0) {
        setShowMalformedPopup(true);
        toast.warning(`Found ${malformedLines.length} malformed log entries`);
      }
    } catch (error) {
      console.error('File processing error:', error);
      handleError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Adding main component render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Adding header section */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Adding main content section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Adding error boundary wrapper */}
          <ErrorBoundary>
            {/* Adding processing indicator */}
            {isProcessing && (
              <ProcessingIndicator 
                progress={processProgress}
                currentStep={processingStats.currentStep}
                stats={processingStats}
              />
            )}
            {/* Adding conditional render for empty state or data view */}
            {!logData.length ? (
              <div>
                <DropZone 
                  onFileUpload={handleFileUpload}
                  onHistoryClick={() => setIsSidebarOpen(true)}
                />
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard logData={logData} />}
                {activeTab === 'analysis' && (
                  <>
                    <FilterSection
                      filters={searchFilters}
                      onFilterChange={setSearchFilters}
                      onSearch={handleSearch}
                      onReset={() => {
                        setSearchFilters({
                          startTime: '',
                          endTime: '',
                          ip: '',
                          statusCode: ''
                        });
                        setFilteredData(logData);
                      }}
                      data={logData}
                      setFilteredData={setFilteredData}
                    />
                    <TablesDashboard data={filteredData} />
                    <ComparisonGraphs data={filteredData} />
                  </>
                )}
                {activeTab === 'security' && (
                  <SecurityDashboard logData={filteredData} />
                )}
                {activeTab === 'settings' && (
                  <div className="bg-white p-6 rounded-lg shadow space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
                    <CacheMonitor />
                  </div>
                )}
              </>
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* Adding sidebar component */}
      <Sidebar 
        files={uploadedFiles}
        onProcess={processLogFile}
        onDelete={handleDeleteFile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Malformed Logs Popup */}
      {showMalformedPopup && (
        <MalformedLogsPopup
          malformedLogs={malformedLogs}
          onClose={() => setShowMalformedPopup(false)}
        />
      )}
      {/* Adding delete confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        filename={deleteDialog.filename}
        onClose={() => setDeleteDialog({ isOpen: false, filename: null })}
        onConfirm={confirmDelete}
      />
      {/* Adding toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
// Adding component export
export default LogAnalyzer;
