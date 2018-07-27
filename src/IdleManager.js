// external dependencies
import cookies from 'browser-cookies';
import React from 'react';
import statics from 'react-statics';
import {
  createComponent,
  createElementRef
} from 'react-parm';

// utils
import {
  getCalculatedNewState,
  getComponentName,
  getDefaultOptions,
  getExistingCookieValues,
  getFreshState,
  shouldSetState,
  setCookieValues
} from './utils';

export const createGetInitialState = (options) => () => getFreshState(options, true);

export const createComponentDidMount = (options) => (instance) => {
  if (options.isDisabled) {
    return;
  }

  instance.intervalId = setInterval(instance.setStateIfChanged, options.pollInterval);

  options.resetTimerEvents.forEach((event) =>
    (options.isScoped && instance.element ? instance.element : window).addEventListener(event, instance.resetTimer)
  );

  window.addEventListener('beforeunload', instance.componentWillUnmount);
};

export const createComponentWillUnmount = (options) => (instance) => {
  clearInterval(instance.intervalId);

  instance.intervalId = null;

  const existingValues = getExistingCookieValues(options.key);

  return existingValues.openWindows <= 1
    ? cookies.erase(options.key)
    : setCookieValues(options, {
      ...existingValues,
      openWindows: existingValues.openWindows - 1,
    });
};

export const createSetStateIfChanged = (options) => (instance, [event]) => {
  const {setState, state} = instance;

  const newState = event instanceof Event ? getFreshState(options) : getCalculatedNewState(options, state);

  return shouldSetState(newState, state)
    ? setState(() => {
      setCookieValues(options, newState);

      return newState;
    })
    : null;
};

export const resetTimer = ({setStateIfChanged}, [event]) => setStateIfChanged(event);

export const idleManager = (passedOptions) => {
  const options = getDefaultOptions(typeof passedOptions === 'string' ? {key: passedOptions} : passedOptions);

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
          resetTimer,
          setStateIfChanged: createSetStateIfChanged(options),
        }
      )
    );
};
