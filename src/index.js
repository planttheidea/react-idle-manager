// external dependencies
import cookies from 'browser-cookies';

// decorators
import {idleManager} from './idleManager';

// utils
import {
  getCalculatedNewState,
  getExistingCookieValues
} from './utils';

/**
 * @function getValues
 *
 * @description
 * get the values for the key provided
 *
 * @param {string} key the key to get the values for
 * @returns {Object} the calculated state for the key provided
 */
export const getValues = (key) => cookies.get(key) && getCalculatedNewState({key}, getExistingCookieValues(key));

export default idleManager;
