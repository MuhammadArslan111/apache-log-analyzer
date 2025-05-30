//  Core React functionality
import React from 'react';
//  Logo asset for header branding
import logo from '../../assets/logo.png';
//  Refresh icon from Feather icons set
import { FiRefreshCw } from 'react-icons/fi';
//  Cache utility for application state management
import { clearCache } from '../../utils/cache';
//  Confirmation dialog component for refresh action
import RefreshConfirmDialog from './RefreshConfirmDialog';

//  Header Component - Main navigation and control interface
const Header = ({ activeTab, onTabChange }) => {
  //  State for controlling refresh confirmation dialog visibility
  const [showRefreshConfirm, setShowRefreshConfirm] = React.useState(false);

  //  Handler for initiating refresh confirmation flow
  const handleRefresh = async () => {
    setShowRefreshConfirm(true);
  };

  //  Handler for executing refresh action after confirmation
  const confirmRefresh = () => {
    clearCache();
    window.location.reload();
  };

  //  Component UI render
  return (
    <>
      {/*  Main header container with fixed positioning */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/*  Logo and application title section */}
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Log Analyzer Logo" 
                className="h-8 w-8 mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-800">Log Analyzer</h1>
            </div>

            {/*  Navigation menu with tab switching buttons */}
            <nav className="flex items-center space-x-4">
              {/*  Dashboard navigation tab */}
              <button 
                onClick={() => onTabChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'dashboard' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}>
                Dashboard
              </button>
              {/*  Analysis navigation tab */}
              <button 
                onClick={() => onTabChange('analysis')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'analysis' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}>
                Analysis
              </button>
              {/*  Security navigation tab */}
              <button 
                onClick={() => onTabChange('security')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'security' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}>
                Security
              </button>
              {/*  Settings navigation tab */}
              <button 
                onClick={() => onTabChange('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'settings' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}>
                Settings
              </button>
            </nav>

            {/*  Action buttons section */}
            <div className="flex items-center space-x-3">
              {/*  Refresh application button */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg flex items-center space-x-2 transition-colors duration-200 hover:bg-gray-100"
                title="Refresh Application"
              >
                <FiRefreshCw className="w-5 h-5" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/*  Refresh confirmation dialog component */}
      <RefreshConfirmDialog
        isOpen={showRefreshConfirm}
        onConfirm={confirmRefresh}
        onCancel={() => setShowRefreshConfirm(false)}
      />
    </>
  );
};

//  Export Header component for use in main application layout
export default Header; 