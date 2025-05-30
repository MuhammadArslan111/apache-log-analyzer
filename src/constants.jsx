// Adding theme configuration for light and dark modes
export const THEME_CLASSES = {
  // Adding light theme color palette
  light: {
    background: 'bg-white',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  // Adding dark theme color palette
  dark: {
    background: 'bg-gray-800',
    text: 'text-gray-100',
    border: 'border-gray-700'
  }
};
// Adding log analysis patterns and configurations
export const LOG_PATTERNS = {
  // Adding security attack pattern detection rules
  ATTACK_PATTERNS: [
    // Adding web shell attack detection
    { pattern: /\.(php|asp|aspx|jsp|cgi)$/i, type: 'WEB_SHELL' },
    // Adding SQL injection attempt detection
    { pattern: /(union|select|insert|drop|delete|update)\s+/i, type: 'SQL_INJECTION' },
    // Adding cross-site scripting (XSS) detection
    { pattern: /(<script|javascript:|onload=|onerror=)/i, type: 'XSS' },
    // Adding administrative access attempt detection
    { pattern: /(admin|administrator|login|wp-admin|phpMyAdmin)/i, type: 'ADMIN_ACCESS' },
    // Adding backup file access detection
    { pattern: /\.(bak|backup|old|temp|tmp)$/i, type: 'BACKUP_FILE' }
  ],
  
  // Adding HTTP status code ranges for categorization
  STATUS_CODES: {
    SUCCESS: { min: 200, max: 299 }, // Adding successful response range
    REDIRECT: { min: 300, max: 399 }, // Adding redirection response range
    CLIENT_ERROR: { min: 400, max: 499 }, // Adding client error response range
    SERVER_ERROR: { min: 500, max: 599 } // Adding server error response range
  },

  // Adding time window constants for analysis periods
  TIME_WINDOWS: {
    MINUTE: 60 * 1000, // Adding minute window in milliseconds
    HOUR: 60 * 60 * 1000, // Adding hour window in milliseconds
    DAY: 24 * 60 * 60 * 1000 // Adding day window in milliseconds
  }
};

// Adding chart color scheme constants
export const CHART_COLORS = {
  primary: '#3B82F6', // Adding primary blue color
  success: '#10B981', // Adding success green color
  warning: '#F59E0B', // Adding warning orange color
  danger: '#EF4444', // Adding danger red color
  info: '#6366F1' // Adding info indigo color
}; 