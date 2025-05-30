// Import necessary dependencies for chart rendering and data processing
import React, { useMemo } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { CHART_COLORS } from '../../constants';
import { 
  processTrafficData, 
  processStatusCodes, 
  processHttpMethods, 
  processTopIPs 
} from '../../utils/analyticsProcessing';

// Register required ChartJS components for chart functionality
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Main dashboard component that displays various analytics charts
const AnalyticsDashboard = ({ logData }) => {
  // Process log data using memoization to prevent unnecessary recalculations
  const analytics = useMemo(() => {
    return {
      // Generate traffic trends over time
      trafficData: processTrafficData(logData),
      // Calculate distribution of HTTP status codes
      statusCodeData: processStatusCodes(logData),
      // Analyze HTTP method usage patterns
      methodsData: processHttpMethods(logData),
      // Identify and process top IP addresses by request frequency
      topIPs: processTopIPs(logData)
    };
  }, [logData]);

  // Define color scheme for different chart types
  const chartColors = {
    line: CHART_COLORS.primary,
    pie: [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.info],
    bar: CHART_COLORS.primary
  };
  // Render dashboard layout with responsive grid system
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Traffic analysis section showing request patterns over time */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Traffic Over Time</h3>
        <Line data={analytics.trafficData} options={lineChartOptions} />
      </div>

      {/* Status code distribution visualization using pie chart */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Status Codes</h3>
        <Pie data={analytics.statusCodeData} options={pieChartOptions} />
      </div>

      {/* HTTP methods breakdown showing request type distribution */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">HTTP Methods</h3>
        <Bar data={analytics.methodsData} options={barChartOptions} />
      </div>

      {/* Top IP addresses visualization showing most frequent visitors */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Top IP Addresses</h3>
        <Bar data={analytics.topIPs} options={barChartOptions} />
      </div>
    </div>
  );
};

// Configuration options for different chart types
// Line chart configuration for time-series data
const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: false }
  }
};

// Pie chart configuration for status code distribution
const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'right' }
  }
};

// Bar chart configuration for HTTP methods and IP addresses
const barChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' }
  }
};

// Export the dashboard component for use in the application
export default AnalyticsDashboard;