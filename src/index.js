// Component
import getWrapComponent from './IdleManager';

// constants
import {
  DEFAULT_OPTIONS,
  INVALID_OPTIONS_ERROR_MESSAGE
} from './constants';

// utils
import {
  isPlainObject
} from './utils';

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
      key: options
    });
  }

  if (options && !isPlainObject(options)) {
    throw new TypeError(INVALID_OPTIONS_ERROR_MESSAGE);
  }

  return getWrapComponent({
    ...DEFAULT_OPTIONS,
    ...options
  });
};

export default idleManager;
