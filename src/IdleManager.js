// external dependencies
import React, {
  Component,
  PureComponent
} from 'react';

// constants
import {
  ONE_SECOND,
  RESET_TIMER_EVENT_LISTENERS,
  STORAGE_EVENT_LISTENER
} from './constants';

// utils
import {
  getComponentName,
  gte,
  hasWindow,
  resetTimers
} from './utils';

/**
 * @function getInitialState
 *
 * @description
 * get the initial state of the component
 *
 * @returns {object} the initial state of the instance
 */
export const getInitialState = () => {
  return {
    isIdle: false,
    isTimedOut: false,
    timeoutIn: null
  };
};

export const createComponentWillMount = (instance, options) => {
  /**
   * @function componentWillMount
   *
   * @description
   * on mount, update the timer and add the even listeners for resetting the timer
   */
  return () => {
    if (hasWindow()) {
      const {
        timeOutAfter,
        idleAfter
      } = resetTimers(options.key, options);

      instance.timeoutTimestamp = timeOutAfter;
      instance.idleTimestamp = idleAfter;

      instance.updateStateIfTimerReached();

      RESET_TIMER_EVENT_LISTENERS.forEach((event) => {
        window.addEventListener(event, instance.resetTimers);
      });

      window.addEventListener(STORAGE_EVENT_LISTENER, instance.syncTimers);
    }
  };
};

export const createComponentWillUnmount = (instance) => {
  /**
   * @function componentWillUnmount
   *
   * @description
   * pprior to unmount, remove the even listeners for resetting the timer
   */
  return () => {
    if (hasWindow()) {
      RESET_TIMER_EVENT_LISTENERS.forEach((event) => {
        window.removeEventListener(event, instance.resetTimers);
      });

      window.removeEventListener(STORAGE_EVENT_LISTENER, instance.syncTimers);
    }
  };
};

export const createResetTimers = (instance, options) => {
  /**
   * @function resetTimers
   *
   * @description
   * reset the timers and the timedOut / warned state
   */
  return () => {
    const {
      timeOutAfter,
      idleAfter
    } = resetTimers(options.key, options);

    instance.timeoutTimestamp = timeOutAfter;
    instance.idleTimestamp = idleAfter;

    instance.setStateIfChanged();
  };
};

export const createSetStateIfChanged = (instance) => {
  /**
   * @function setStateIfChanged
   *
   * @description if the state has changed, update it
   *
   * @param {number} [now=Date.now()] the date to be relative to
   */
  return () => {
    const {
      isTimedOut: wasTimedOut,
      timeoutIn: previousTimeoutIn
    } = instance.state;

    const now = Date.now();

    const isTimedOut = gte(now, instance.timeoutTimestamp);
    const isIdle = gte(now, instance.idleTimestamp);
    const timeoutIn = isIdle ? instance.timeoutTimestamp - now : null;

    if (isTimedOut !== wasTimedOut || previousTimeoutIn !== timeoutIn) {
      instance.setState(() => {
        return {
          isIdle,
          isTimedOut,
          timeoutIn: gte(timeoutIn, 0) ? timeoutIn : 0
        };
      });
    }
  };
};

export const createSyncTimers = (instance, options) => {
  /**
   * @function syncTimers
   *
   * @description
   * when the storage event is fired, update the instance values if the key matches
   *
   * @param {StorageEvent} event the storage event fired by the browser
   */
  return (event) => {
    if (event && event.key === options.key) {
      const newValues = JSON.parse(event.newValue);

      instance.idleTimestamp = newValues.idleAfter;
      instance.timeoutTimestamp = newValues.timeOutAfter;

      instance.setStateIfChanged();
    }
  };
};

export const createUpdateStateIfTimerReached = (instance) => {
  /**
   * @function updateStateIfTimerReached
   *
   * @description
   * check if the timed out / warned state has been reached and if so update the state
   */
  return () => {
    clearTimeout(instance.updateStateIfTimerReached);

    instance.setStateIfChanged();

    instance.countdownTimeout = setTimeout(instance.updateStateIfTimerReached, ONE_SECOND);
  };
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
export const getWrapComponent = (options) => {
  const ComponentToExtend = options.isPure ? PureComponent : Component;

  return (WrappedComponent) => {
    return class IdleManager extends ComponentToExtend {
      static displayName = `IdleManager(${getComponentName(WrappedComponent)})`;

      // state
      state = getInitialState(this, options);

      // lifecycle methods
      componentWillMount = createComponentWillMount(this, options);
      componentWillUnmount = createComponentWillUnmount(this);

      // instance values
      countdownTimeout = null;
      idleTimestamp = null;
      timeoutTimestamp = null;

      // instance methods
      resetTimers = createResetTimers(this, options);
      setStateIfChanged = createSetStateIfChanged(this);
      syncTimers = createSyncTimers(this, options);
      updateStateIfTimerReached = createUpdateStateIfTimerReached(this);

      render() {
        return (
          <WrappedComponent
            {...this.props}
            {...this.state}
          />
        );
      }
    };
  };
};

export default getWrapComponent;
