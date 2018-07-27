// external dependencies
import PropTypes from 'prop-types';
import React from 'react';
import {createComponent} from 'react-parm';
import statics from 'react-statics';
import uuid from 'uuid/v4';

// decorators
import {cookieManager} from './cookieManager';

// constants
import {
  ONE_SECOND,
  RESET_TIMER_EVENT_LISTENERS
} from './constants';

// utils
import {
  getComponentName,
  getCurrentState,
  hasWindow,
  resetTimers
  // store
} from './utils';

/**
 * @constant {Object} INITIAL_STATE
 */
export const INITIAL_STATE = {
  isIdle: false,
  isTimedOut: false,
  timeoutIn: null,
};

export const WINDOW_ID = uuid();

export const getInitialValues = (options) => ({props: {cookies}}) => hasWindow() && resetTimers(options, cookies);

export const onConstruct = (options) => ({resetInstanceTimers, updateStateIfTimerReached}) => {
  if (hasWindow()) {
    updateStateIfTimerReached();

    RESET_TIMER_EVENT_LISTENERS.forEach((event) => {
      window.addEventListener(event, resetInstanceTimers);
    });
  }
};

export const componentWillUnmount = (options) => ({resetInstanceTimers, syncTimers}) => {
  if (hasWindow()) {
    RESET_TIMER_EVENT_LISTENERS.forEach((event) => {
      window.removeEventListener(event, resetInstanceTimers);
    });
  }
};

export const resetInstanceTimers = (options) => (instance) => {
  const {
    props: {cookies},
  } = instance;

  const {idleTimestamp, timeoutTimestamp} = resetTimers(options, cookies);

  instance.idleTimestamp = idleTimestamp;
  instance.timeoutTimestamp = timeoutTimestamp;

  instance.setStateIfChanged();
};

export const setStateIfChanged = (instance) => {
  const {
    setState,
    state: {isTimedOut: wasTimedOut, timeoutIn: previousTimeoutIn},
  } = instance;

  const newState = getCurrentState(instance);

  return (
    (newState.isTimedOut !== wasTimedOut || previousTimeoutIn !== newState.timeoutIn)
    && setState(
      () =>
        // store.set({
        //   idleTimestamp: instance.idleTimestamp,
        //   timeoutTimestamp: instance.timeoutTimestamp,
        //   windowId: WINDOW_ID,
        // });

        newState
    )
  );
};

export const syncTimers = (options) => (instance, [value]) => {
  console.log(value);
};

/**
 * @function updateStateIfTimerReached
 *
 * @description
 * check if the timed out / warned state has been reached and if so update the state
 */
export const updateStateIfTimerReached = (instance) => {
  clearTimeout(instance.countdownTimeout);

  instance.setStateIfChanged();

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
    propTypes: {
      cookies: PropTypes.object.isRequired,
    },
  })(
    cookieManager(
      createComponent(({cookies, ...props}, {state}) => <WrappedComponent {...props} {...state} />, {
        componentWillUnmount: componentWillUnmount(options),
        countdownTimeout: null,
        getInitialValues,
        idleTimestamp: null,
        isPure: options.isPure,
        onConstruct: onConstruct(options),
        resetInstanceTimers: resetInstanceTimers(options),
        setStateIfChanged,
        state: INITIAL_STATE,
        syncTimers: syncTimers(options),
        timeoutTimestamp: null,
        updateStateIfTimerReached,
      }),
      options
    )
  );

export default getWrapComponent;
