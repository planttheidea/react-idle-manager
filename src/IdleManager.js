// external dependencies
import React from 'react';
import {createComponent} from 'react-parm';
import statics from 'react-statics';
import uuid from 'uuid/v4';

// constants
import {
  MESSAGE_EVENT_LISTENER,
  ONE_SECOND,
  RESET_TIMER_EVENT_LISTENERS
} from './constants';

// utils
import {
  getComponentName,
  getCurrentState,
  hasWindow,
  resetTimers
} from './utils';

/**
 * @constant {Object} INITIAL_STATE
 */
export const INITIAL_STATE = {
  isIdle: false,
  isTimedOut: false,
  timeoutIn: null,
};

export const getInitialValues = (options) => () => hasWindow() && resetTimers(options.key, options);

export const onConstruct = ({resetInstanceTimers, syncTimers, updateStateIfTimerReached}) => {
  if (hasWindow()) {
    updateStateIfTimerReached(false);

    RESET_TIMER_EVENT_LISTENERS.forEach((event) => {
      window.addEventListener(event, resetInstanceTimers);
    });

    window.addEventListener(MESSAGE_EVENT_LISTENER, syncTimers);
  }
};

export const componentWillUnmount = ({resetInstanceTimers, syncTimers}) => {
  if (hasWindow()) {
    RESET_TIMER_EVENT_LISTENERS.forEach((event) => {
      window.removeEventListener(event, resetInstanceTimers);
    });

    window.removeEventListener(MESSAGE_EVENT_LISTENER, syncTimers);
  }
};

export const resetInstanceTimers = (options) => (instance) => {
  const {idleTimestamp, timeoutTimestamp} = resetTimers(options.key, options);

  instance.idleTimestamp = idleTimestamp;
  instance.timeoutTimestamp = timeoutTimestamp;

  instance.setStateIfChanged(true);
};

export const setStateIfChanged = (options) => (instance, [shouldNotify]) => {
  const {
    setState,
    state: {isTimedOut: wasTimedOut, timeoutIn: previousTimeoutIn},
  } = instance;

  const newState = getCurrentState(instance);

  return (
    (newState.isTimedOut !== wasTimedOut || previousTimeoutIn !== newState.timeoutIn)
    && setState(() => {
      if (shouldNotify) {
        window.postMessage(
          JSON.stringify({
            idleTimestamp: instance.idleTimestamp,
            timeoutTimestamp: instance.timeoutTimestamp,
            windowId: instance.windowId,
          }),
          options.domain
        );
      }

      return newState;
    })
  );
};

export const syncTimers = (options) => (instance, [event]) => {
  const {data, origin} = event;

  try {
    const message = JSON.parse(data);

    if (origin === options.domain && message && message.windowId && message.windowId !== instance.windowId) {
      instance.idleTimestamp = message.idleTimestamp;
      instance.timeoutTimestamp = message.timeoutTimestamp;

      instance.setStateIfChanged(false);
    }
  } catch (error) {
    // nothing
  }
};

/**
 * @function updateStateIfTimerReached
 *
 * @description
 * check if the timed out / warned state has been reached and if so update the state
 *
 * @param {boolean} [shouldUpdateState=true] should the state be updated
 */
export const updateStateIfTimerReached = (instance, [shouldUpdateState = true]) => {
  clearTimeout(instance.countdownTimeout);

  if (shouldUpdateState) {
    instance.setStateIfChanged(true);
  }

  instance.countdownTimeout = setTimeout(instance.updateStateIfTimerReached, ONE_SECOND);
};

/**
 * @function getWrapComponent
 *
 * @description
 * higher-order function that accepts the options and returns the decorator that will return
 * the wrapping component
 *
 * @param {Object} options the options passed to the component
 * @returns {function(ReactComponent): ReactComponent} the decorator function returning the wrapping component
 */
export const getWrapComponent = (options) => (WrappedComponent) =>
  statics({
    displayName: `IdleManager(${getComponentName(WrappedComponent)})`,
  })(
    createComponent((props, {state}) => <WrappedComponent {...props} {...state} />, {
      componentWillUnmount,
      countdownTimeout: null,
      getInitialValues,
      idleTimestamp: null,
      isPure: options.isPure,
      onConstruct,
      resetInstanceTimers: resetInstanceTimers(options),
      setStateIfChanged: setStateIfChanged(options),
      state: INITIAL_STATE,
      syncTimers: syncTimers(options),
      timeoutTimestamp: null,
      updateStateIfTimerReached,
      windowId: uuid(),
    })
  );

export default getWrapComponent;
