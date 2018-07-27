// external dependencies
import cookies from 'browser-cookies';

// constants
import {
  DEFAULT_OPTIONS,
  FUNCTION_NAME_REGEXP
} from './constants';

export const getExistingCookieValues = (key) => JSON.parse(cookies.get(key) || '{}');

export const getCalculatedNewState = (options, state) => {
  const now = Date.now();

  const {idleTimestamp = state.idleTimestamp, timeoutTimestamp = state.timeoutTimestamp} = getExistingCookieValues(
    options.key
  );

  return {
    idleIn: Math.max(idleTimestamp - now, 0),
    idleTimestamp,
    isIdle: now >= idleTimestamp,
    isTimedOut: now >= timeoutTimestamp,
    timeoutIn: Math.max(timeoutTimestamp - now, 0),
    timeoutTimestamp,
  };
};

export const getCalculatedTimestamps = (options) => {
  const {idleAfter = DEFAULT_OPTIONS.idleAfter, timeOutAfter = DEFAULT_OPTIONS.timeOutAfter} = options;
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

export const getDefaultOptions = (options) => ({
  ...DEFAULT_OPTIONS,
  ...options,
});

export const setCookieValues = (options, {idleTimestamp, openWindows, timeoutTimestamp}, increaseWindows) => {
  const {openWindows: existingOpenWindows = 0} = getExistingCookieValues(options.key);

  cookies.set(
    options.key,
    JSON.stringify({
      idleTimestamp,
      openWindows: openWindows || (increaseWindows ? existingOpenWindows + 1 : existingOpenWindows),
      timeoutTimestamp,
    }),
    options.storageOptions
  );
};

export const getFreshState = (options, increaseWindows = false) => {
  const {idleAfter, idleTimestamp, timeOutAfter, timeoutTimestamp} = getCalculatedTimestamps(options);

  setCookieValues(
    options,
    {
      idleTimestamp,
      timeoutTimestamp,
    },
    increaseWindows
  );

  return {
    idleIn: idleAfter,
    idleTimestamp,
    isIdle: false,
    isTimedOut: false,
    timeoutIn: idleAfter + timeOutAfter,
    timeoutTimestamp,
  };
};

export const shouldSetState = (newState, existingState) =>
  newState.isIdle
    ? !existingState.isIdle
      || newState.isTimedOut !== existingState.isTimedOut
      || newState.timeoutIn !== existingState.timeoutIn
    : existingState.isIdle;
