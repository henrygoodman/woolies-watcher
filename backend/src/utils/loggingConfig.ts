const getCallerInfo = () => {
  const error = new Error();
  const stack = error.stack || '';
  const stackLines = stack.split('\n');

  if (stackLines.length < 4) {
    return 'unknown location';
  }

  const callerLine = stackLines[3].trimStart();

  // Find the first occurrence of '/' and extract everything after it
  const firstSlashIndex = callerLine.indexOf('/');
  if (firstSlashIndex !== -1) {
    return callerLine.substring(firstSlashIndex).trim();
  }

  // Fallback to splitting on the first 'at' instance
  const firstAtIndex = callerLine.indexOf('at');
  if (firstAtIndex !== -1) {
    return callerLine.substring(firstAtIndex + 2).trim(); // Skip 'at'
  }

  return 'unknown location';
};

const setupLogging = () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.log = (...args) => {
    const timestamp = new Date().toISOString();
    const callerInfo = getCallerInfo();
    originalConsoleLog(`[INFO - ${timestamp}] [${callerInfo}]`, ...args);
  };

  console.error = (...args) => {
    const timestamp = new Date().toISOString();
    const callerInfo = getCallerInfo();
    originalConsoleError(`[ERROR - ${timestamp}] [${callerInfo}]`, ...args);
  };

  console.warn = (...args) => {
    const timestamp = new Date().toISOString();
    const callerInfo = getCallerInfo();
    originalConsoleWarn(`[WARN - ${timestamp}] [${callerInfo}]`, ...args);
  };
};

export default setupLogging;
