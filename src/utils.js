// external dependencies
import cookies from 'browser-cookies';

// constants
import {
  DEFAULT_OPTIONS,
  FUNCTION_NAME_REGEXP
} from './constants';

/**
 * @function getExistingCookieValues
 *
 * @description
 * get the cookie values available, defaulting to an empty object
 *
 * @param {string} key the cookie key
 * @returns {Object} the stored values
 */
export const getExistingCookieValues = (key) => JSON.parse(cookies.get(key) || '{}');

/**
 * @function getCalculatedNewState
 *
 * @description
 * get the new state calculated based on the options passed
 *
 * @param {Object} options the options passed to the decorator
 * @param {string} options.key the key to get the existing values from in cookies
 * @param {Object} state the current state of the component instance
 * @param {number} state.idleTimestamp the current idleTimestamp in state
 * @param {number} state.timeoutTimestamp the current timeoutTimestamp in state
 * @returns {Object} the calculated new state of the component instance
 */
export const getCalculatedNewState = (
  {key},
  {idleTimestamp: currentIdleTimestamp, timeoutTimestamp: currentTimeoutTimestamp}
) => {
  const {idleTimestamp = currentIdleTimestamp, timeoutTimestamp = currentTimeoutTimestamp} = getExistingCookieValues(
    key
  );
  const now = Date.now();

  return {
    idleIn: Math.max(idleTimestamp - now, 0),
    idleTimestamp,
    isIdle: now >= idleTimestamp,
    isTimedOut: now >= timeoutTimestamp,
    timeoutIn: Math.max(timeoutTimestamp - now, 0),
    timeoutTimestamp,
  };
};

/**
 * @function getCalculatedTimestamps
 *
 * @description
 * get the calculated timestamp-related data for the component state
 *
 * @param {Object} options the options passed to the decorator
 * @param {number} [options.idleAfter=DEFAULT_OPTIONS.idleAfter] the number of ms to wait before being idle
 * @param {number} [options.timeOutAfter=DEFAULT_OPTIONS.timeOutAfter] the number of ms to wait before being timedout
 * @returns {Object} the calculated timestamps object
 */
export const getCalculatedTimestamps = ({
  idleAfter = DEFAULT_OPTIONS.idleAfter,
  timeOutAfter = DEFAULT_OPTIONS.timeOutAfter,
}) => {
  const now = Date.now();

  return {
    idleAfter,
    idleTimestamp: now + idleAfter,
    timeOutAfter,
    timeoutTimestamp: now + idleAfter + timeOutAfter,
  };
};

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
export const getFunctionNameViaRegexp = (fn) => (fn.toString().match(FUNCTION_NAME_REGEXP) || [])[1] || '';

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
 * @function getNormalizedOptions
 *
 * @description
 * get the options normalized with the defaults
 *
 * @param {Object} options the options passed to the decorator
 * @returns {Object} the coalesced options
 */
export const getNormalizedOptions = (options) => ({
  ...DEFAULT_OPTIONS,
  ...options,
});

/**
 * @function setCookieValues
 *
 * @description
 * set the cookie values based on the options and state passed
 *
 * @param {Object} options the options passed to the decorator
 * @param {string} options.key the key to get the existing values from in cookies
 * @param {Object} [options.storageOptions] the options to apply when setting the cookies
 * @param {Object} values the object of values to assign
 * @param {number} values.idleTimestamp the timestamp of when the next idle state will occur
 * @param {number} values.timeoutTimestamp the timestamp of when the next timeout state will occur
 * @returns {void}
 */
export const setCookieValues = ({key, storageOptions}, {idleTimestamp, timeoutTimestamp}) =>
  cookies.set(
    key,
    JSON.stringify({
      idleTimestamp,
      timeoutTimestamp,
    }),
    storageOptions
  );

/**
 * @function getFreshState
 *
 * @description
 * get a refreshed state object based on the options passed
 *
 * @param {Object} options the options passed to the decorator
 * @returns {Object} the refreshed state values
 */
export const getFreshState = (options) => {
  const {idleAfter, idleTimestamp, timeOutAfter, timeoutTimestamp} = getCalculatedTimestamps(options);

  setCookieValues(options, {
    idleTimestamp,
    timeoutTimestamp,
  });

  return {
    idleIn: idleAfter,
    idleTimestamp,
    isIdle: false,
    isTimedOut: false,
    timeoutIn: idleAfter + timeOutAfter,
    timeoutTimestamp,
  };
};

/**
 * @function shouldSetState
 *
 * @description
 * should the new state passed be applied to the component and passed to the child
 *
 * @param {Object} newState the new state to potentially apply
 * @param {Object} currentState the current state of the component instance
 * @returns {boolean} should the new state be applied to the component isntance
 */
export const shouldSetState = (newState, currentState) =>
  newState.isIdle
    ? !currentState.isIdle
      || newState.isTimedOut !== currentState.isTimedOut
      || newState.timeoutIn !== currentState.timeoutIn
    : currentState.isIdle;
