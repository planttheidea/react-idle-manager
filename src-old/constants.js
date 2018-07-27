/**
 * @constant {number} ONE_SECOND
 * @default
 */
export const ONE_SECOND = 1000;

/**
 * @constant {number} ONE_MINUTE
 * @default
 */
export const ONE_MINUTE = ONE_SECOND * 60;

/**
 * @constant {number} DEFAULT_TIMEOUT_AFTER
 * @default
 */
export const DEFAULT_TIMEOUT_AFTER = ONE_MINUTE * 15;

/**
 * @constant {number} DEFAULT_IDLE_AFTER
 * @default
 */
export const DEFAULT_IDLE_AFTER = DEFAULT_TIMEOUT_AFTER - ONE_MINUTE;

/**
 * @constant {Object} DEFAULT_OPTIONS
 */
export const DEFAULT_OPTIONS = {
  idleAfter: DEFAULT_IDLE_AFTER,
  isPure: true,
  timeOutAfter: ONE_MINUTE,
};

/**
 * @constant {RegExp} FUNCTION_NAME_REGEXP
 */
export const FUNCTION_NAME_REGEXP = /^\s*function\s+([^\(\s]*)\s*/;

/**
 * @constant {string} INVALID_OPTIONS_ERROR_MESSAGE
 * @default
 */
export const INVALID_OPTIONS_ERROR_MESSAGE =
  'When using idleManager, you must pass either a string key or an object of options.';

/**
 * @constant {Array<string>} RESET_TIMER_EVENT_LISTENERS
 */
export const RESET_TIMER_EVENT_LISTENERS = ['click', 'keydown', 'mousemove', 'scroll'];
