// external dependencies
import cookies from 'browser-cookies';
import React from 'react';
import statics from 'react-statics';
import {
  createComponent,
  createElementRef,
} from 'react-parm';

// constants
import {BEFORE_UNLOAD} from './constants';

// utils
import {
  getCalculatedNewState,
  getComponentName,
  getFreshState,
  getNormalizedOptions,
  shouldSetState,
  setCookieValues,
} from './utils';

const {hasOwnProperty} = Object.prototype;

export const createGetInitialState = (options) =>
  /**
   * @function getInitialState
   *
   * @description
   * get the initial state of the component instance
   *
   * @returns {Object} the initial state of the instance
   */
  () => getFreshState(options);

/**
 * @function componentDidMount
 *
 * @description
 * on mount, if not disabled then watch for activity to reset the timer
 *
 * @param {ReactComponent} instance the component instance
 * @returns {void}
 */
export const componentDidMount = ({addListeners, options}) =>
  options.isDisabled ? cookies.erase(options.key, options.storageOptions) : addListeners();

/**
 * @function componentWillUnmount
 *
 * @description
 * prior to unmount, either reduce the number of open windows or remove the cookie entirely
 *
 * @param {ReactComponent} instance the component instance
 * @returns {void}
 */
export const componentWillUnmount = ({options: {isDisabled}, removeListeners}) => !isDisabled && removeListeners();

/**
 * @function addListeners
 *
 * @description
 * add the listeners for the component instance
 *
 * @param {ReactComponent} instance the component instance
 */
export const addListeners = (instance) => {
  const {
    componentWillUnmount,
    element,
    options: {isScoped, pollInterval, resetTimerEvents},
    setStateIfChanged,
  } = instance;

  // eslint-disable-next-line no-param-reassign
  instance.intervalId = setInterval(setStateIfChanged, pollInterval);

  resetTimerEvents.forEach((event) =>
    (isScoped && element ? element : window).addEventListener(event, setStateIfChanged)
  );

  window.addEventListener(BEFORE_UNLOAD, componentWillUnmount);
};

/**
 * @function removeListeners
 *
 * @description
 * remove the listeners for the component instance
 *
 * @param {ReactComponent} instance the component instance
 */
export const removeListeners = (instance) => {
  const {
    componentWillUnmount,
    intervalId,
    options: {isScoped, resetTimerEvents},
    setStateIfChanged,
  } = instance;

  resetTimerEvents.forEach((event) => !isScoped && window.removeEventListener(event, setStateIfChanged));

  window.removeEventListener(BEFORE_UNLOAD, componentWillUnmount);

  clearInterval(intervalId);

  // eslint-disable-next-line no-param-reassign
  instance.intervalId = null;
};

/**
 * @function setStateIfChanged
 *
 * @description
 * set the state of the instance if the state has changed and should be deleted
 *
 * @param {function} setStateValues the method to set the values in component instance state
 * @param {Object} state the current state of the component instance
 * @param {Event} [event] the event passed to the function
 * @returns {void}
 */
export const setStateIfChanged = ({options, setStateValues, state}, [event]) => {
  const newState = event instanceof Event ? getFreshState(options) : getCalculatedNewState(options, state);

  return shouldSetState(newState, state) ? setStateValues(newState) : null;
};

/**
 * @function setStateValues
 *
 * @description
 * set the new values in state and in cookies
 *
 * @param {Object} options the options for the instance
 * @param {function} setState the method to set the state of the component instance
 * @returns {void}
 */
export const setStateValues = ({options, setState}, [newState]) =>
  setState(() => {
    setCookieValues(options, newState);

    return newState;
  });

/**
 * @function updateIdleManagerOptions
 *
 * @description
 * update the options specific to the instance
 *
 * @param {ReactComponent} instance the component instance
 * @param {Object} newOptions the new options to assign
 */
export const updateIdleManagerOptions = (instance, [newOptions]) => {
  const {addListeners, options, removeListeners, setStateValues} = instance;

  const existingOptions = {...options};

  Object.keys(newOptions).forEach((key) => {
    if (key === 'key') {
      // eslint-disable-next-line no-console
      return console.error('The idle manager key cannot be updated.');
    }

    if (key === 'isDisabled' && newOptions[key] !== options[key]) {
      // eslint-disable-next-line max-depth
      if (existingOptions.isDisabled) {
        addListeners();
      } else {
        removeListeners();
      }
    }

    // eslint-disable-next-line no-param-reassign
    return Object.prototype.hasOwnProperty.call(options, key) && (instance.options[key] = newOptions[key]);
  });

  setStateValues(getFreshState(options));
};

/**
 * @function idleManager
 *
 * @description
 * create a higher-order component decorator that handles timer prop delegation
 *
 * @param {Object|string} passedOptions the options passed to the decorator
 * @returns {function(ReactComponent): ReactComponent} the decorator that creates the HOC
 */
export const idleManager = (passedOptions) => {
  const options = getNormalizedOptions(typeof passedOptions === 'string' ? {key: passedOptions} : passedOptions);

  if (!hasOwnProperty.call(options, 'key')) {
    throw ReferenceError(
      'You must pass either the unique key or an object of options that contains the key to the method.'
    );
  }

  if (hasOwnProperty.call(options, 'timeOutAfter')) {
    // eslint-disable-next-line no-console
    console.warn(
      `The option "timeOutAfter" has been changed to "timeoutAfter", please check the options related to key "${
        options.key
      }".`
    );
  }

  return (Component) =>
    statics({
      displayName: `IdleManager(${getComponentName(Component)})`,
    })(
      createComponent(
        (props, instance) => (
          // eslint workaround
          <Component
            ref={createElementRef(instance, 'element')}
            {...props}
            {...instance.state}
            updateIdleManagerOptions={instance.updateIdleManagerOptions}
          />
        ),
        {
          addListeners,
          componentDidMount,
          componentWillUnmount,
          element: null,
          getInitialState: createGetInitialState(options),
          isPure: options.isPure,
          options,
          removeListeners,
          setStateIfChanged,
          setStateValues,
          updateIdleManagerOptions,
        }
      )
    );
};
