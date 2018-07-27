// constants
import {FUNCTION_NAME_REGEXP} from './constants';

/**
 * @private
 *
 * @function getFunctionNameViaRegexp
 *
 * @description
 * use regexp match on stringified function to get the function name
 *
 * @param {function} fn function to get the name of
 * @returns {string} function name
 */
export const getFunctionNameViaRegexp = (fn) => {
  const match = fn.toString().match(FUNCTION_NAME_REGEXP);

  return match ? match[1] : '';
};

/**
 * @private
 *
 * @function getComponentName
 *
 * @description
 * get the component name, either from modern property or regexp match, falling back to generic string
 *
 * @param {function} fn function to get the name of
 * @returns {string} function name
 */
export const getComponentName = (fn) => fn.displayName || fn.name || getFunctionNameViaRegexp(fn) || 'Component';

/**
 * @private
 *
 * @function getCurrentState
 *
 * @description
 * get the current state of the instance based on its idle and timeout timestamps
 *
 * @param {Object|ReactComponent} instance the instance to get the current values from
 * @returns {Object} the current state values
 */
export const getCurrentState = (instance) => {
  const now = Date.now();

  const isTimedOut = now >= instance.timeoutTimestamp;
  const isIdle = now >= instance.idleTimestamp;
  const timeoutIn = isIdle ? Math.max(instance.timeoutTimestamp - now, 0) : null;

  return {
    isIdle,
    isTimedOut,
    timeoutIn,
  };
};

/**
 * @function hasWindow
 *
 * @description
 * does the window exist
 *
 * @returns {boolean} does the window exist
 */
export const hasWindow = () => typeof window !== 'undefined';

/**
 * @function isPlainObject
 *
 * @description
 * is the object passed a plain object
 *
 * @param {*} object the object to test
 * @returns {boolean} is the object a plain object
 */
export const isPlainObject = (object) => !!object && object.constructor === Object;

/**
 * @function resetTimers
 *
 * @description
 * reset the timers to new values based on the current datetime
 *
 * @param {Object} options the options passed to the component instance
 * @param {number} options.idleAfter the amount of milliseconds to wait before warning of impending out
 * @param {string} options.key the key to assign the values to
 * @param {number} options.timeOutAfter the amount of milliseconds to wait before timing out
 * @returns {Object} the new values saved in storage
 */
export const resetTimers = (options, cookies) => {
  const idleTimestamp = Date.now() + options.idleAfter;

  const newValues = {
    idleTimestamp,
    timeoutTimestamp: idleTimestamp + options.timeOutAfter,
  };

  cookies.set(options.key, newValues);

  return newValues;
};
