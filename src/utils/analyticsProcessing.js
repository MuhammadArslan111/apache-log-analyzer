// Adding chart color constants
import { CHART_COLORS } from '../constants';
// Adding traffic data processing function for timeline visualization
export const processTrafficData = (logs) => {
  // Adding hourly traffic accumulator
  const timeData = {};
  // Adding log entry processing for hourly distribution
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    timeData[hour] = (timeData[hour] || 0) + 1;
  });

  // Adding chart data structure for timeline visualization
  return {
    labels: Object.keys(timeData),
    datasets: [{
      label: 'Requests per Hour',
      data: Object.values(timeData),
      borderColor: CHART_COLORS.primary,
      backgroundColor: `${CHART_COLORS.primary}33`,
      tension: 0.3
    }]
  };
};
// Adding status code distribution processor for pie chart
export const processStatusCodes = (logs) => {
  // Adding status code categories accumulator
  const statusCodes = {
    'Success (2xx)': 0,
    'Redirect (3xx)': 0,
    'Client Error (4xx)': 0,
    'Server Error (5xx)': 0
  };

  // Adding status code classification and counting
  logs.forEach(log => {
    const code = log.statusCode;
    if (code >= 200 && code < 300) statusCodes['Success (2xx)']++;
    else if (code >= 300 && code < 400) statusCodes['Redirect (3xx)']++;
    else if (code >= 400 && code < 500) statusCodes['Client Error (4xx)']++;
    else if (code >= 500) statusCodes['Server Error (5xx)']++;
  });

  // Adding chart data structure for status code visualization
  return {
    labels: Object.keys(statusCodes),
    datasets: [{
      data: Object.values(statusCodes),
      backgroundColor: [
        CHART_COLORS.success,
        CHART_COLORS.info,
        CHART_COLORS.warning,
        CHART_COLORS.danger
      ]
    }]
  };
};
// Adding HTTP methods distribution processor for bar chart
export const processHttpMethods = (logs) => {
  // Adding HTTP methods accumulator
  const methods = {};
  // Adding method counting logic
  logs.forEach(log => {
    methods[log.method] = (methods[log.method] || 0) + 1;
  });

  // Adding chart data structure for methods visualization
  return {
    labels: Object.keys(methods),
    datasets: [{
      label: 'HTTP Methods',
      data: Object.values(methods),
      backgroundColor: CHART_COLORS.primary
    }]
  };
};
// Adding top IP addresses processor for bar chart
export const processTopIPs = (logs) => {
  // Adding IP address accumulator
  const ips = {};
  // Adding IP counting logic
  logs.forEach(log => {
    ips[log.ip] = (ips[log.ip] || 0) + 1;
  });

  // Adding top 10 IPs sorting and filtering
  const topIPs = Object.entries(ips)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  // Adding chart data structure for IP visualization  
  return {
    labels: topIPs.map(([ip]) => ip),
    datasets: [{
      label: 'Requests per IP',
      data: topIPs.map(([,count]) => count),
      backgroundColor: CHART_COLORS.info
    }]
  };
}; 