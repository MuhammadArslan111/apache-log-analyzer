// Adding necessary React components and hooks
import React, { useState } from 'react';
// Adding main LogAnalyzer component
import LogAnalyzer from './LogAnalyzer';
// Adding loading animation component
import SplashScreen from './components/common/SplashScreen';
// Adding main App component for application initialization
function App() {
  // Adding state management for splash screen visibility
  const [showSplash, setShowSplash] = useState(true);

  // Adding handler for splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Adding main component render structure
  return (
    <div className="app">
      {/* Adding conditional render for splash screen or main content */}
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <LogAnalyzer />
      )}
    </div>
  );
}
// Adding component export
export default App; 