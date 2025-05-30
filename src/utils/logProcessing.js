import _ from 'lodash';

export const processLogLine = (line) => {
  // Ensure line is a string
  if (typeof line !== 'string') {
    throw new Error('Invalid log entry: not a string');
  }

  const regex = /^(\S+) - - \[(.*?)\] "(\S+) (.*?) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)"/;
  const match = line.match(regex);

  if (!match) {
    // Additional validation checks
    if (!line.includes('"')) {
      throw new Error('Missing quotation marks in log entry');
    }
    if (!line.includes('[')) {
      throw new Error('Missing timestamp bracket');
    }
    if (!/\d{3}/.test(line)) {
      throw new Error('Missing or invalid status code');
    }
    return null;
  }

  const [, ip, timestamp, method, path, protocol, statusCode, bytes, referer, userAgent] = match;

  // Additional validation
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }
  
  if (!isValidTimestamp(timestamp)) {
    throw new Error('Invalid timestamp format');
  }

  return {
    ip,
    timestamp: new Date(timestamp.replace(':', ' ')),
    method,
    path,
    protocol,
    statusCode: parseInt(statusCode),
    bytes: parseInt(bytes),
    referer,
    userAgent
  };
};

// Helper validation functions
const isValidIP = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  return ip.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
};

const isValidTimestamp = (timestamp) => {
  const date = new Date(timestamp.replace(':', ' '));
  return date instanceof Date && !isNaN(date);
};

export const batchProcessLines = async (lines, onProgress) => {
  if (!Array.isArray(lines)) {
    throw new Error('Expected an array of log lines');
  }

  const processedLines = [];
  const droppedLines = [];

  lines.forEach((line, index) => {
    // Skip null, undefined, or non-string values
    if (!line || typeof line !== 'string') {
      droppedLines.push({
        line: String(line),
        lineNumber: index + 1,
        reason: 'Invalid data type'
      });
      return;
    }

    try {
      const processed = processLogLine(line.trim());
      if (processed) {
        processedLines.push(processed);
      } else {
        droppedLines.push({
          line,
          lineNumber: index + 1,
          reason: 'Invalid format'
        });
      }
    } catch (error) {
      droppedLines.push({
        line,
        lineNumber: index + 1,
        reason: error.message
      });
    }

    if (onProgress && (index + 1) % 1000 === 0) {
      onProgress((index + 1) / lines.length * 100);
    }
  });

  return { processedLines, droppedLines };
};

export const filterLogs = (logs, filters) => {
  return logs.filter(log => {
    // IP Filter - handles multiple IPs
    if (filters.ip) {
      const selectedIPs = filters.ip.split(',');
      if (!selectedIPs.includes(log.ip)) {
        return false;
      }
    }

    if (filters.method && log.method !== filters.method) return false;
    if (filters.statusCode && !log.statusCode.toString().startsWith(filters.statusCode[0])) return false;
    if (filters.userAgent && !log.userAgent.includes(filters.userAgent)) return false;
    if (filters.startTime && new Date(log.timestamp) < new Date(filters.startTime)) return false;
    if (filters.endTime && new Date(log.timestamp) > new Date(filters.endTime)) return false;
    return true;
  });
}; 