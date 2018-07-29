/**
 * @constant {Object} DEFAULT_OPTIONS
 */
export const DEFAULT_OPTIONS = {
  idleAfter: 14000,
  isScoped: false,
  pollInterval: 1000,
  resetTimerEvents: ['click', 'keydown', 'mousemove', 'scroll'],
  timeOutAfter: 1000,
};

/**
 * @constant {RegExp} FUNCTION_NAME_REGEXP
 */
export const FUNCTION_NAME_REGEXP = /^\s*function\s+([^\(\s]*)\s*/;
