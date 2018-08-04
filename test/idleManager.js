/* eslint-disable no-magic-numbers */

// test
import test from 'ava';
import cookies from 'browser-cookies';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import sinon from 'sinon';

// src
import * as idleManager from 'src/idleManager';
import * as utils from 'src/utils';
import * as constants from 'src/constants';
import {updateIdleManagerOptions} from '../src/idleManager';

test('if createGetInitialState will call getFreshState with the options passed', (t) => {
  const options = {some: 'thing'};

  const freshState = {fresh: 'state'};

  const getFreshStateStub = sinon.stub(utils, 'getFreshState').returns(freshState);

  const result = idleManager.createGetInitialState(options)();

  t.true(getFreshStateStub.calledOnce);
  t.true(getFreshStateStub.calledWith(options));

  getFreshStateStub.restore();

  t.is(result, freshState);
});

test('if componentDidMount will add the correct listeners', (t) => {
  const options = {
    isDisabled: false,
    isScoped: false,
    key: 'key',
    pollInterval: 1000,
    resetTimerEvents: ['click'],
  };
  const instance = {
    addListeners: sinon.spy(),
    componentWillUnmount() {},
    element: {
      addEventListener: sinon.spy(),
    },
    intervalId: null,
    options,
    setStateIfChanged() {},
  };

  const newIntervalId = 123;

  const cookiesStub = sinon.stub(cookies, 'erase');

  idleManager.componentDidMount(instance);

  t.true(cookiesStub.notCalled);

  cookiesStub.restore();

  t.true(instance.addListeners.calledOnce);
});

test('if componentDidMount will not add the correct listeners if disabled', (t) => {
  const options = {
    isDisabled: true,
    isScoped: false,
    key: 'key',
    pollInterval: 1000,
    resetTimerEvents: ['click'],
  };
  const instance = {
    addListeners: sinon.spy(),
    componentWillUnmount() {},
    element: {
      addEventListener: sinon.spy(),
    },
    intervalId: null,
    options,
    setStateIfChanged() {},
  };

  const cookiesStub = sinon.stub(cookies, 'erase');

  idleManager.componentDidMount(instance);

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledWith(options.key));

  cookiesStub.restore();

  t.true(instance.addListeners.notCalled);
});

test('if componentWillUnmount will remove the listeners when not disabled', (t) => {
  const instance = {
    options: {
      isDisabled: false,
    },
    removeListeners: sinon.spy(),
  };

  idleManager.componentWillUnmount(instance);

  t.true(instance.removeListeners.calledOnce);
});

test('if componentWillUnmount will not remove the listeners when disabled', (t) => {
  const instance = {
    options: {
      isDisabled: true,
    },
    removeListeners: sinon.spy(),
  };

  idleManager.componentWillUnmount(instance);

  t.true(instance.removeListeners.notCalled);
});

test('if addListeners will add the correct listeners', (t) => {
  const options = {
    isDisabled: false,
    isScoped: false,
    key: 'key',
    pollInterval: 1000,
    resetTimerEvents: ['click'],
  };
  const instance = {
    componentWillUnmount() {},
    element: {
      addEventListener: sinon.spy(),
    },
    intervalId: null,
    options,
    setStateIfChanged() {},
  };

  const newIntervalId = 123;

  const setIntervalStub = sinon.stub(global, 'setInterval').returns(newIntervalId);
  const windowListenerStub = sinon.stub(window, 'addEventListener');

  idleManager.addListeners(instance);

  t.true(instance.element.addEventListener.notCalled);

  t.true(setIntervalStub.calledOnce);
  t.true(setIntervalStub.calledWith(instance.setStateIfChanged, options.pollInterval));

  setIntervalStub.restore();

  t.is(instance.intervalId, newIntervalId);

  t.true(windowListenerStub.calledTwice);
  t.deepEqual(windowListenerStub.args, [
    ...options.resetTimerEvents.map((event) => [event, instance.setStateIfChanged]),
    [constants.BEFORE_UNLOAD, instance.componentWillUnmount],
  ]);

  windowListenerStub.restore();
});

test('if addListeners will add the correct listeners when scoped', (t) => {
  const options = {
    isDisabled: false,
    isScoped: true,
    key: 'key',
    pollInterval: 1000,
    resetTimerEvents: ['click'],
  };
  const instance = {
    componentWillUnmount() {},
    element: {
      addEventListener: sinon.spy(),
    },
    intervalId: null,
    options,
    setStateIfChanged() {},
  };

  const newIntervalId = 123;

  const setIntervalStub = sinon.stub(global, 'setInterval').returns(newIntervalId);
  const windowListenerStub = sinon.stub(window, 'addEventListener');

  idleManager.addListeners(instance);

  t.true(instance.element.addEventListener.calledOnce);
  t.deepEqual(instance.element.addEventListener.args[0], [options.resetTimerEvents[0], instance.setStateIfChanged]);

  t.true(setIntervalStub.calledOnce);
  t.true(setIntervalStub.calledWith(instance.setStateIfChanged, options.pollInterval));

  setIntervalStub.restore();

  t.is(instance.intervalId, newIntervalId);

  t.true(windowListenerStub.calledOnce);
  t.deepEqual(windowListenerStub.args[0], [constants.BEFORE_UNLOAD, instance.componentWillUnmount]);

  windowListenerStub.restore();
});

test('if removeListeners will remove all listeners and clear the interval', (t) => {
  const options = {
    isDisabled: false,
    isScoped: false,
    resetTimerEvents: ['click'],
  };
  const intervalId = 123;
  const instance = {
    componentWillUnmount() {},
    intervalId,
    options,
    setStateIfChanged() {},
  };

  const clearIntervalStub = sinon.stub(global, 'clearInterval');
  const windowListenerStub = sinon.stub(window, 'removeEventListener');

  idleManager.removeListeners(instance);

  t.true(windowListenerStub.calledTwice);
  t.deepEqual(windowListenerStub.args, [
    ...options.resetTimerEvents.map((event) => [event, instance.setStateIfChanged]),
    [constants.BEFORE_UNLOAD, instance.componentWillUnmount],
  ]);

  windowListenerStub.restore();

  t.true(clearIntervalStub.calledOnce);
  t.true(clearIntervalStub.calledWith(intervalId));

  clearIntervalStub.restore();

  t.is(instance.intervalId, null);
});

test('if removeListeners will remove only unload unscoped listeners', (t) => {
  const options = {
    isDisabled: false,
    isScoped: true,
    resetTimerEvents: ['click'],
  };
  const intervalId = 123;
  const instance = {
    componentWillUnmount() {},
    intervalId,
    options,
    setStateIfChanged() {},
  };

  const clearIntervalStub = sinon.stub(global, 'clearInterval');
  const windowListenerStub = sinon.stub(window, 'removeEventListener');

  idleManager.removeListeners(instance);

  t.true(windowListenerStub.calledOnce);
  t.deepEqual(windowListenerStub.args[0], [constants.BEFORE_UNLOAD, instance.componentWillUnmount]);

  windowListenerStub.restore();

  t.true(clearIntervalStub.calledOnce);
  t.true(clearIntervalStub.calledWith(intervalId));

  clearIntervalStub.restore();

  t.is(instance.intervalId, null);
});

test('if setStateIfChanged will set the state if it should', (t) => {
  const now = 123456789000;
  const nowStub = sinon.stub(constants, 'getNow').returns(now);

  const options = {
    ...constants.DEFAULT_OPTIONS,
    key: 'key',
  };
  const instance = {
    options,
    setStateValues: sinon.spy(),
    state: {},
  };

  const event = new Event('click');

  const shouldSetStateStub = sinon.stub(utils, 'shouldSetState').returns(true);

  idleManager.setStateIfChanged(instance, [event]);

  nowStub.restore();

  t.true(shouldSetStateStub.calledOnce);

  shouldSetStateStub.restore();

  t.true(instance.setStateValues.calledOnce);
});

test('if setStateIfChanged will set the state if it should when the event is not an event', (t) => {
  const now = 123456789000;
  const nowStub = sinon.stub(constants, 'getNow').returns(now);

  const options = {
    ...constants.DEFAULT_OPTIONS,
    key: 'key',
  };
  const instance = {
    options,
    setStateValues: sinon.spy(),
    state: utils.getFreshState(options),
  };

  const shouldSetStateStub = sinon.stub(utils, 'shouldSetState').returns(true);

  idleManager.setStateIfChanged(instance, []);

  nowStub.restore();

  t.true(shouldSetStateStub.calledOnce);

  shouldSetStateStub.restore();

  t.true(instance.setStateValues.calledOnce);
});

test('if setStateIfChanged will not set the state if it should not', (t) => {
  const now = 123456789000;
  const nowStub = sinon.stub(constants, 'getNow').returns(now);

  const options = {
    ...constants.DEFAULT_OPTIONS,
    key: 'key',
  };
  const instance = {
    options,
    setStateValues: sinon.spy(),
    state: {},
  };

  const event = new Event('click');

  const shouldSetStateStub = sinon.stub(utils, 'shouldSetState').returns(false);

  idleManager.setStateIfChanged(instance, [event]);

  nowStub.restore();

  t.true(shouldSetStateStub.calledOnce);

  shouldSetStateStub.restore();

  t.true(instance.setStateValues.notCalled);
});

test('if setStateValues will set the cookie values and assign the new state', (t) => {
  const newState = {
    some: 'newState',
  };

  const instance = {
    options: {
      some: 'options',
    },
    setState: sinon.stub().callsFake((fn) => {
      const result = fn();

      t.is(result, newState);
    }),
  };

  const cookiesStub = sinon.stub(utils, 'setCookieValues');

  idleManager.setStateValues(instance, [newState]);

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledOnceWith(instance.options, newState));

  cookiesStub.restore();

  t.true(instance.setState.calledOnce);
});

test('if updateIdleManagerOptions will update the options on the instance', (t) => {
  const originalOptions = {
    idleAfter: 1000,
    isDisabled: false,
    key: 'key',
    timeoutAfter: 2000,
  };

  const instance = {
    addListeners: sinon.spy(),
    options: {...originalOptions},
    removeListeners: sinon.spy(),
    setStateValues: sinon.spy(),
  };

  const newOptions = {
    idleAfter: 5000,
    isDisabled: false,
    key: 'newKey',
    unused: 'field',
  };

  const consoleStub = sinon.stub(console, 'error');

  idleManager.updateIdleManagerOptions(instance, [newOptions]);

  t.true(consoleStub.calledOnce);

  consoleStub.restore();

  t.true(instance.addListeners.notCalled);

  t.true(instance.removeListeners.notCalled);

  t.deepEqual(instance.options, {
    ...originalOptions,
    idleAfter: newOptions.idleAfter,
  });

  t.true(instance.setStateValues.calledOnce);
});

test('if updateIdleManagerOptions will call addListeners if originally disabled', (t) => {
  const originalOptions = {
    idleAfter: 1000,
    isDisabled: true,
    key: 'key',
    timeoutAfter: 2000,
  };

  const instance = {
    addListeners: sinon.spy(),
    options: {...originalOptions},
    removeListeners: sinon.spy(),
    setStateValues: sinon.spy(),
  };

  const newOptions = {
    idleAfter: 5000,
    isDisabled: false,
    key: 'newKey',
  };

  const consoleStub = sinon.stub(console, 'error');

  idleManager.updateIdleManagerOptions(instance, [newOptions]);

  t.true(consoleStub.calledOnce);

  consoleStub.restore();

  t.true(instance.addListeners.calledOnce);

  t.true(instance.removeListeners.notCalled);

  t.deepEqual(instance.options, {
    ...originalOptions,
    idleAfter: newOptions.idleAfter,
    isDisabled: newOptions.isDisabled,
  });

  t.true(instance.setStateValues.calledOnce);
});

test('if updateIdleManagerOptions will call removeListeners if originally enabled', (t) => {
  const originalOptions = {
    idleAfter: 1000,
    isDisabled: false,
    key: 'key',
    timeoutAfter: 2000,
  };

  const instance = {
    addListeners: sinon.spy(),
    options: {...originalOptions},
    removeListeners: sinon.spy(),
    setStateValues: sinon.spy(),
  };

  const newOptions = {
    idleAfter: 5000,
    isDisabled: true,
    key: 'newKey',
  };

  const consoleStub = sinon.stub(console, 'error');

  idleManager.updateIdleManagerOptions(instance, [newOptions]);

  t.true(consoleStub.calledOnce);

  consoleStub.restore();

  t.true(instance.addListeners.notCalled);

  t.true(instance.removeListeners.calledOnce);

  t.deepEqual(instance.options, {
    ...originalOptions,
    idleAfter: newOptions.idleAfter,
    isDisabled: newOptions.isDisabled,
  });

  t.true(instance.setStateValues.calledOnce);
});

test('if idleManager will throw an error if no key is passed', (t) => {
  const options = {};

  t.throws(() => {
    idleManager.idleManager(options);
  }, ReferenceError);
});

test('if idleManager will warn when the old timeOutAfter property is used', (t) => {
  const options = {
    key: 'key',
    timeOutAfter: 1000,
  };

  const stub = sinon.stub(console, 'warn');

  idleManager.idleManager(options);

  t.true(stub.calledOnce);

  stub.restore();
});

test('if idleManager will return an HOC based on the component passed', (t) => {
  const options = 'key';
  const Component = (props) => {
    console.log(props);

    return <div />;
  };

  Component.displayName = 'Component';

  const Wrapped = idleManager.idleManager(options)(Component);

  const now = 1234567891000;
  const nowStub = sinon.stub(constants, 'getNow').returns(now);

  t.is(Wrapped.displayName, `IdleManager(${Component.displayName})`);

  const wrapper = shallow(<Wrapped />);

  t.snapshot(toJson(wrapper));

  nowStub.restore();
});
