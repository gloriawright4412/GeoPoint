export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprinting', 2, 2);
  }
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    !!window.indexedDB,
    typeof(Worker),
    navigator.platform,
    navigator.doNotTrack,
    canvas.toDataURL(),
    navigator.hardwareConcurrency,
    navigator.deviceMemory,
    navigator.maxTouchPoints,
  ].filter(Boolean);
  
  return btoa(components.join('|')).slice(0, 32);
}

export function getDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  let platform = 'unknown';
  
  // Detect device type
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)/i.test(ua)) {
    deviceType = 'tablet';
  }
  
  // Detect platform
  if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Mac/i.test(ua)) platform = 'macOS';
  else if (/Linux/i.test(ua)) platform = 'Linux';
  else if (/Android/i.test(ua)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
  
  // Detect browser
  let browser = 'unknown';
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  else if (/Opera/i.test(ua)) browser = 'Opera';
  
  return {
    deviceFingerprint: generateDeviceFingerprint(),
    deviceType,
    platform,
    browser,
    browserVersion: getBrowserVersion(ua, browser),
    userAgent: ua,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    deviceModel: getDeviceModel(ua),
    osVersion: getOSVersion(ua, platform),
  };
}

function getBrowserVersion(ua: string, browser: string): string {
  const patterns: { [key: string]: RegExp } = {
    Chrome: /Chrome\/([0-9.]+)/,
    Firefox: /Firefox\/([0-9.]+)/,
    Safari: /Version\/([0-9.]+)/,
    Edge: /Edge\/([0-9.]+)/,
    Opera: /Opera\/([0-9.]+)/,
  };
  
  const pattern = patterns[browser];
  if (pattern) {
    const match = ua.match(pattern);
    return match ? match[1] : 'unknown';
  }
  return 'unknown';
}

function getDeviceModel(ua: string): string {
  // iPhone models
  if (/iPhone/i.test(ua)) {
    if (/iPhone OS 15_|iPhone15/i.test(ua)) return 'iPhone 14/15 Series';
    if (/iPhone OS 14_|iPhone14/i.test(ua)) return 'iPhone 12/13 Series';
    if (/iPhone OS 13_|iPhone13/i.test(ua)) return 'iPhone 11 Series';
    return 'iPhone';
  }
  
  // iPad models
  if (/iPad/i.test(ua)) {
    return 'iPad';
  }
  
  // Android models
  const androidMatch = ua.match(/Android[^;]*;\s*([^)]+)/);
  if (androidMatch) {
    return androidMatch[1].trim();
  }
  
  return 'Unknown';
}

function getOSVersion(ua: string, platform: string): string {
  const patterns: { [key: string]: RegExp } = {
    Windows: /Windows NT ([0-9.]+)/,
    macOS: /Mac OS X ([0-9._]+)/,
    iOS: /OS ([0-9._]+)/,
    Android: /Android ([0-9.]+)/,
    Linux: /Linux/,
  };
  
  const pattern = patterns[platform];
  if (pattern && platform !== 'Linux') {
    const match = ua.match(pattern);
    return match ? match[1].replace(/_/g, '.') : 'unknown';
  }
  return 'unknown';
}

export async function getMacAddress(): Promise<string | null> {
  // Note: MAC address access is restricted in modern browsers for privacy
  // This is a placeholder for native app implementations
  return null;
}

export async function getIMEI(): Promise<string | null> {
  // Note: IMEI access requires native mobile app with special permissions
  // This is a placeholder for native app implementations
  return null;
}