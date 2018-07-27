export const DEFAULT_OPTIONS = {
  idleAfter: 14000,
  isScoped: false,
  pollInterval: 1000,
  timeOutAfter: 1000,
};

/**
 * @constant {RegExp} FUNCTION_NAME_REGEXP
 */
export const FUNCTION_NAME_REGEXP = /^\s*function\s+([^\(\s]*)\s*/;

/**
 * @constant {Array<string>} RESET_TIMER_EVENT_LISTENERS
 */
export const RESET_TIMER_EVENT_LISTENERS = ['click', 'keydown', 'mousemove', 'scroll'];
