export const parseUserAgent = (ua) => {
  const userAgent = ua.toLowerCase();

  // Browser detection
  const getBrowser = () => {
    if (userAgent.includes('edg/')) return 'Edge';
    if (userAgent.includes('chrome/')) return 'Chrome';
    if (userAgent.includes('firefox/')) return 'Firefox';
    if (userAgent.includes('safari/') && !userAgent.includes('chrome')) return 'Safari';
    if (userAgent.includes('opr/') || userAgent.includes('opera/')) return 'Opera';
    return 'Other';
  };

  // OS detection
  const getOS = () => {
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('macintosh') || userAgent.includes('mac os x')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
    return 'Other';
  };

  return {
    browser: getBrowser(),
    os: getOS()
  };
}; 