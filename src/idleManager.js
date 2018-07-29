// external dependencies
import cookies from 'browser-cookies';
import React from 'react';
import statics from 'react-statics';
import {
  createComponent,
  createElementRef
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
  setCookieValues
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

export const createComponentDidMount = (options) =>
  /**
   * @function componentDidMount
   *
   * @description
   * on mount, if not disabled then watch for activity to reset the timer
   *
   * @param {ReactComponent} instance the component instance
   */
  (instance) => {
    const {isDisabled, key} = options;

    if (isDisabled) {
      return cookies.erase(key, options);
    }

    const {isScoped, pollInterval, resetTimerEvents} = options;
    const {componentWillUnmount, element, setStateIfChanged} = instance;

    // eslint-disable-next-line no-param-reassign
    instance.intervalId = setInterval(setStateIfChanged, pollInterval);

    resetTimerEvents.forEach((event) =>
      (isScoped && element ? element : window).addEventListener(event, setStateIfChanged)
    );

    window.addEventListener(BEFORE_UNLOAD, componentWillUnmount);
  };

export const createComponentWillUnmount = (options) =>
  /**
   * @function componentWillUnmount
   *
   * @description
   * prior to unmount, either reduce the number of open windows or remove the cookie entirely
   *
   * @param {ReactComponent} instance the component instance
   */
  (instance) => {
    const {componentWillUnmount, intervalId, setStateIfChanged} = instance;
    const {isDisabled, isScoped, resetTimerEvents} = options;

    if (isDisabled) {
      return;
    }

    resetTimerEvents.forEach((event) => !isScoped && window.removeEventListener(event, setStateIfChanged));

    window.removeEventListener(BEFORE_UNLOAD, componentWillUnmount);

    clearInterval(intervalId);

    // eslint-disable-next-line no-param-reassign
    instance.intervalId = null;
  };

export const createSetStateIfChanged = (options) =>
  /**
   * @function setStateIfChanged
   *
   * @description
   * set the state of the instance if the state has changed and should be deleted
   *
   * @param {function} setState the method to set the component instance state
   * @param {Object} state the current state of the component instance
   * @param {Event} [event] the event passed to the function
   * @returns {void}
   */
  ({setState, state}, [event]) => {
    const newState = event instanceof Event ? getFreshState(options) : getCalculatedNewState(options, state);

    return shouldSetState(newState, state)
      ? setState(() => {
        setCookieValues(options, newState);

        return newState;
      })
      : null;
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
          />
        ),
        {
          componentDidMount: createComponentDidMount(options),
          componentWillUnmount: createComponentWillUnmount(options),
          element: null,
          getInitialState: createGetInitialState(options),
          isPure: options.isPure,
          setStateIfChanged: createSetStateIfChanged(options),
        }
      )
    );
};
