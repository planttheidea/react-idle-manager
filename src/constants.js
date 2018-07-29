/**
 * @constant {Object} DEFAULT_OPTIONS
 */
export const DEFAULT_OPTIONS = {
  idleAfter: 840000,
  isPure: false,
  isScoped: false,
  pollInterval: 1000,
  resetTimerEvents: ['click', 'keydown', 'mousemove', 'scroll'],
  timeoutAfter: 60000,
};

/**
 * @constant {RegExp} FUNCTION_NAME_REGEXP
 */
export const FUNCTION_NAME_REGEXP = /^\s*function\s+([^\(\s]*)\s*/;
