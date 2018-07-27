// Component
import getWrapComponent from './IdleManager';

// constants
import {
  DEFAULT_OPTIONS,
  INVALID_OPTIONS_ERROR_MESSAGE
} from './constants';

// utils
import {
  getCurrentState,
  isPlainObject
  // store
} from './utils';

/**
 * @function getValues
 *
 * @description
 * get the values that currently exist for the key provided
 *
 * @param {string} key the key to assign the values to
 * @returns {Object} the current state for the given key
 */
export const getValues = (key) => {
  // const values = store.get(key);
  // return (
  //   values
  //   && getCurrentState({
  //     idleTimestamp: values.idleAfter,
  //     timeoutTimestamp: values.timeOutAfter,
  //   })
  // );
};

/**
 * @function idleManager
 *
 * @description
 * create a higher-order component that manages timeouts and passes down the time until timeout
 * once the warning threshold is reached
 *
 * @param {Object|ReactComponent} options the options for the component, or the component itself
 * @returns {ReactComponent} the higher-order component that manages session timeouts
 */
export const idleManager = (options) => {
  if (typeof options === 'string') {
    return getWrapComponent({
      ...DEFAULT_OPTIONS,
      domain: typeof document !== 'undefined' ? document.origin : '',
      key: options,
    });
  }

  if (options && !isPlainObject(options)) {
    throw new TypeError(INVALID_OPTIONS_ERROR_MESSAGE);
  }

  return getWrapComponent({
    ...DEFAULT_OPTIONS,
    ...options,
    domain: options.domain || (typeof document !== 'undefined' ? document.origin : ''),
  });
};

export default idleManager;
