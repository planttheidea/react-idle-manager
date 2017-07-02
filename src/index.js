// Component
import getWrapComponent from './IdleManager';

// constants
import {
  DEFAULT_OPTIONS
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
  if (typeof options === 'function') {
    return getWrapComponent(DEFAULT_OPTIONS)(options);
  }

  if (options && !isPlainObject(options)) {
    throw new TypeError('If options are passed, they must be a plain object.');
  }

  return getWrapComponent({
    ...DEFAULT_OPTIONS,
    ...options
  });
};

export default idleManager;
