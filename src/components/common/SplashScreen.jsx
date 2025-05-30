//  Required React hooks for component state and effects
import React, { useEffect, useState } from 'react';
//  Logo asset for branding in splash screen
import logo from '../../assets/logo.png';
//  Feather icons for feature cards
import { FiShield, FiGlobe, FiPieChart, FiActivity } from 'react-icons/fi';

//  Array of loading messages for dynamic display
const LOADING_MESSAGES = [
  "Initializing log analysis engine...",
  "Loading geographic data...",
  "Preparing visualization components...",
  "Configuring security scanners...",
  "Loading statistical modules..."
];

//  FeatureCard Component - Reusable card for displaying features
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all duration-300">
    <div className="flex items-start space-x-3">
      {/*  Icon container with background */}
      <div className="p-2 bg-blue-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      {/*  Feature text content */}
      <div>
        <h3 className="text-white/90 font-medium mb-1">{title}</h3>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

//  SplashScreen Component - Initial loading screen with animations
const SplashScreen = ({ onComplete }) => {
  //  State management for visibility and loading progress
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(LOADING_MESSAGES[0]);
  const [progress, setProgress] = useState(0);

  //  Effect hook for managing loading animation and timing
  useEffect(() => {
    //  Configuration for loading animation timing
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    //  Progress bar animation timer
    const progressTimer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      
      //  Completion check and cleanup
      if (currentStep >= steps) {
        clearInterval(progressTimer);
        setIsVisible(false);
        if (onComplete) onComplete();
      }
    }, interval);

    //  Loading message rotation timer
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 500);

    //  Cleanup function for timers
    return () => {
      clearInterval(progressTimer);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  //  Early return if splash screen should not be visible
  if (!isVisible) return null;

  return (
    //  Main container with gradient background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-blue-950">
      <div className="max-w-4xl w-full mx-4 space-y-12">
        {/*  Logo and title section */}
        <div className="text-center space-y-6">
          {/*  Logo with glowing effect */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <img 
              src={logo} 
              alt="Log Analyzer Logo"
              className="w-24 h-24 relative mx-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Log Analyzer
          </h1>
          <p className="text-blue-200/80 text-lg">
            Advanced Log Analysis & Visualization
          </p>
        </div>

        {/*  Features grid section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto px-4">
          {/*  Individual feature cards */}
          <FeatureCard 
            icon={FiGlobe}
            title="Geographic Insights"
            description="Visualize traffic patterns across the globe"
          />
          <FeatureCard 
            icon={FiShield}
            title="Security Analysis"
            description="Identify potential security threats"
          />
          <FeatureCard 
            icon={FiPieChart}
            title="Visual Analytics"
            description="Interactive charts and data visualization"
          />
          <FeatureCard 
            icon={FiActivity}
            title="Real-time Processing"
            description="Process and analyze logs in real-time"
          />
        </div>

        {/*  Loading section with progress bar */}
        <div className="max-w-md mx-auto px-4 space-y-4">
          {/*  Dynamic loading message */}
          <div className="text-center">
            <p className="text-blue-200/80 text-sm min-h-[20px] transition-all duration-200">
              {currentMessage}
            </p>
          </div>

          {/*  Animated progress bar */}
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/*  Loading dots animation */}
          <div className="flex justify-center space-x-2">
            <span className="animate-pulse inline-block w-2 h-2 bg-blue-400 rounded-full opacity-75"></span>
            <span className="animate-pulse inline-block w-2 h-2 bg-blue-400 rounded-full opacity-75" style={{ animationDelay: '0.2s' }}></span>
            <span className="animate-pulse inline-block w-2 h-2 bg-blue-400 rounded-full opacity-75" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>

        {/*  Version information footer */}
        <div className="text-center text-blue-200/50 text-sm">
          <p>Educational Purposes Only | Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

//  Export SplashScreen component for use in application startup
export default SplashScreen; 