//  Core React functionality for error boundary implementation
import React from 'react';

//  ErrorBoundary Class Component - Catches and handles rendering errors
class ErrorBoundary extends React.Component {
  //  Initial state to track error status
  state = { hasError: false };

  //  Static lifecycle method to update state when an error occurs
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  //  Error handler method for custom error processing
  handleError = (error) => {
    this.setState({
      hasError: true,
      error: error
    });
  };

  //  Render method with conditional error UI
  render() {
    //  Display error UI if an error has occurred
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h2 className="text-xl text-red-600">Something went wrong</h2>
          {/*  Reload button to reset application state */}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reload Application
          </button>
        </div>
      );
    }
    //  Render children components when no error occurs
    return this.props.children;
  }
}

//  Export ErrorBoundary component for use as a wrapper component
export default ErrorBoundary; 