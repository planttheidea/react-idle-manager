// test
import test from 'ava';
import {
  shallow
} from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import sinon from 'sinon';

// src
import * as component from 'src/IdleManager';
import * as constants from 'src/constants';
import * as utils from 'src/utils';

test('if getInitialState returns the correct initial state', (t) => {
  const result = component.getInitialState();

  t.deepEqual(result, {
    isIdle: false,
    isTimedOut: false,
    timeoutIn: null
  });
});

test.serial('if createComponentWillMount will call addEventListener on the window for the appropriate methods', (t) => {
  const instance = {
    idleTimestamp: null,
    resetTimers() {},
    syncTimers() {},
    timeoutTimestamp: null,
    updateStateIfTimerReached: sinon.spy()
  };
  const options = {
    key: 'foo',
    idleAfter: 'idleAfter',
    timeOutAfter: 'timeOutAfter'
  };

  const componentWillMount = component.createComponentWillMount(instance, options);

  t.is(typeof componentWillMount, 'function');

  const current = global.window;

  global.window = {
    addEventListener: sinon.spy()
  };

  const resetTimersStub = sinon.stub(utils, 'resetTimers').returns(options);

  componentWillMount();

  t.true(resetTimersStub.calledOnce);
  t.true(resetTimersStub.calledWith(options.key, options));

  resetTimersStub.restore();

  t.true(instance.updateStateIfTimerReached.calledOnce);

  const totalCount = constants.RESET_TIMER_EVENT_LISTENERS.length + 1;

  t.is(global.window.addEventListener.callCount, totalCount);

  const resetListenerArguments = constants.RESET_TIMER_EVENT_LISTENERS.map((event) => {
    return [event, instance.resetTimers];
  });

  t.deepEqual(global.window.addEventListener.args, [
    ...resetListenerArguments,
    [constants.STORAGE_EVENT_LISTENER, instance.syncTimers]
  ]);

  global.window = current;
});

test('if createComponentWillMount will not call addEventListener if there is no window', (t) => {
  const instance = {
    idleTimestamp: null,
    resetTimers() {},
    syncTimers() {},
    timeoutTimestamp: null,
    updateStateIfTimerReached: sinon.spy()
  };
  const options = {
    key: 'foo',
    idleAfter: 'idleAfter',
    timeOutAfter: 'timeOutAfter'
  };

  const componentWillMount = component.createComponentWillMount(instance, options);

  t.is(typeof componentWillMount, 'function');

  try {
    componentWillMount();

    t.pass();
  } catch (error) {
    t.fail(error);
  }
});

test.serial('if createComponentWillUnmount will call removeEventListener on the window for the appropriate methods', (t) => {
  const instance = {
    resetTimers() {},
    syncTimers() {}
  };

  const componentWillUnmount = component.createComponentWillUnmount(instance);

  t.is(typeof componentWillUnmount, 'function');

  const current = global.window;

  global.window = {
    removeEventListener: sinon.spy()
  };

  componentWillUnmount();

  const totalCount = constants.RESET_TIMER_EVENT_LISTENERS.length + 1;

  t.is(global.window.removeEventListener.callCount, totalCount);

  const resetListenerArguments = constants.RESET_TIMER_EVENT_LISTENERS.map((event) => {
    return [event, instance.resetTimers];
  });

  t.deepEqual(global.window.removeEventListener.args, [
    ...resetListenerArguments,
    [constants.STORAGE_EVENT_LISTENER, instance.syncTimers]
  ]);

  global.window = current;
});

test('if createComponentWillUnmount will not call removeEventListener if there is no window', (t) => {
  const instance = {
    resetTimers() {},
    syncTimers() {}
  };

  const componentWillUnmount = component.createComponentWillUnmount(instance);

  t.is(typeof componentWillUnmount, 'function');

  try {
    componentWillUnmount();

    t.pass();
  } catch (error) {
    t.fail(error);
  }
});

test('if createResetTimers will update the timestamps on the instance', (t) => {
  const instance = {
    idleTimestamp: null,
    setState: sinon.spy(),
    state: {
      timeoutIn: null
    },
    timeoutTimestamp: null
  };
  const options = {
    idleAfter: 'idleAfter',
    key: 'foo',
    timeOutAfter: 'timeOutAfter'
  };

  const resetTimers = component.createResetTimers(instance, options);

  t.is(typeof resetTimers, 'function');

  const resetTimersStub = sinon.stub(utils, 'resetTimers').returns(options);

  resetTimers();

  t.true(resetTimersStub.calledOnce);
  t.true(resetTimersStub.calledWith(options.key, options));

  resetTimersStub.restore();

  t.deepEqual(instance, {
    ...instance,
    idleTimestamp: options.idleAfter,
    timeoutTimestamp: options.timeOutAfter
  });

  t.true(instance.setState.notCalled);
});

test('if createResetTimers will call setState when timeoutIn is not null', (t) => {
  const instance = {
    idleTimestamp: null,
    setState: sinon.spy(),
    state: {
      timeoutIn: 123
    },
    timeoutTimestamp: null
  };
  const options = {
    idleAfter: 'idleAfter',
    key: 'foo',
    timeOutAfter: 'timeOutAfter'
  };

  const resetTimers = component.createResetTimers(instance, options);

  t.is(typeof resetTimers, 'function');

  const resetTimersStub = sinon.stub(utils, 'resetTimers').returns(options);

  resetTimers();

  t.true(resetTimersStub.calledOnce);
  t.true(resetTimersStub.calledWith(options.key, options));

  resetTimersStub.restore();

  t.deepEqual(instance, {
    ...instance,
    idleTimestamp: options.idleAfter,
    timeoutTimestamp: options.timeOutAfter
  });

  t.true(instance.setState.calledOnce);

  const setStateResult = instance.setState.firstCall.args[0]();

  t.deepEqual(setStateResult, {
    isIdle: false,
    isTimedOut: false,
    timeoutIn: null
  });
});

test('if createSyncTimers will create a method that sets the timestamps to the values in the event passed', (t) => {
  const instance = {
    idleTimestamp: null,
    timeoutTimestamp: null
  };
  const options = {
    key: 'foo'
  };

  const syncTimers = component.createSyncTimers(instance, options);

  t.is(typeof syncTimers, 'function');

  const newValue = {
    idleAfter: 'idleAfter',
    timeOutAfter: 'timeoutAfter'
  };

  const event = {
    key: options.key,
    newValue: JSON.stringify(newValue)
  };

  syncTimers(event);

  t.deepEqual(instance, {
    ...instance,
    idleTimestamp: newValue.idleAfter,
    timeoutTimestamp: newValue.timeOutAfter
  });
});

test('if createSyncTimers will not call anything if there is no event', (t) => {
  const instance = {
    idleTimestamp: null,
    timeoutTimestamp: null
  };
  const options = {
    key: 'foo'
  };

  const syncTimers = component.createSyncTimers(instance, options);

  t.is(typeof syncTimers, 'function');

  try {
    syncTimers();

    t.is(instance.idleTimestamp, null);
    t.is(instance.timeoutTimestamp, null);
  } catch (error) {
    t.fail(error);
  }
});

test('if createSyncTimers will not call anything if the event key is different from the options key', (t) => {
  const instance = {
    idleTimestamp: null,
    timeoutTimestamp: null
  };
  const options = {
    key: 'foo'
  };

  const syncTimers = component.createSyncTimers(instance, options);

  t.is(typeof syncTimers, 'function');

  const event = {
    key: 'bar'
  };

  syncTimers(event);

  try {
    syncTimers();

    t.is(instance.idleTimestamp, null);
    t.is(instance.timeoutTimestamp, null);
  } catch (error) {
    t.fail(error);
  }
});

test('if createUpdateStateIfTimerReached will create a method that sets the countdownTimeout', (t) => {
  const instance = {
    countdownTimeout: null,
    idleTimestamp: Date.now() + 1000,
    setState: sinon.spy(),
    timeoutTimestamp: Date.now() + 2000,
    updateStateIfTimerReached: sinon.spy()
  };

  const updateStateIfTimerReached = component.createUpdateStateIfTimerReached(instance);

  t.is(typeof updateStateIfTimerReached, 'function');

  const timer = 123;

  const clearTimeoutStub = sinon.stub(global, 'clearTimeout');
  const setTimeoutStub = sinon.stub(global, 'setTimeout').returns(timer);

  updateStateIfTimerReached();

  t.true(clearTimeoutStub.calledOnce);
  t.true(clearTimeoutStub.calledWith(instance.updateStateIfTimerReached));

  clearTimeoutStub.restore();

  t.true(instance.setState.notCalled);

  t.is(instance.countdownTimeout, timer);

  t.true(setTimeoutStub.calledOnce);
  t.true(setTimeoutStub.calledWith(instance.updateStateIfTimerReached));

  setTimeoutStub.restore();
});

test('if createUpdateStateIfTimerReached will set the state if is idle', (t) => {
  const instance = {
    countdownTimeout: null,
    idleTimestamp: Date.now() - 1000,
    setState: sinon.spy(),
    timeoutTimestamp: Date.now() + 2000,
    updateStateIfTimerReached: sinon.spy()
  };

  const updateStateIfTimerReached = component.createUpdateStateIfTimerReached(instance);

  t.is(typeof updateStateIfTimerReached, 'function');

  const timer = 123;

  const clearTimeoutStub = sinon.stub(global, 'clearTimeout');
  const setTimeoutStub = sinon.stub(global, 'setTimeout').returns(timer);

  updateStateIfTimerReached();

  t.true(clearTimeoutStub.calledOnce);
  t.true(clearTimeoutStub.calledWith(instance.updateStateIfTimerReached));

  clearTimeoutStub.restore();

  t.true(instance.setState.calledOnce);

  const setStateResult = instance.setState.firstCall.args[0]();

  t.true(setStateResult.isIdle);
  t.false(setStateResult.isTimedOut);
  t.not(setStateResult.timeoutIn, 0);

  t.is(instance.countdownTimeout, timer);

  t.true(setTimeoutStub.calledOnce);
  t.true(setTimeoutStub.calledWith(instance.updateStateIfTimerReached));

  setTimeoutStub.restore();
});

test('if createUpdateStateIfTimerReached will set the state if is timed out', (t) => {
  const instance = {
    countdownTimeout: null,
    idleTimestamp: Date.now() - 2000,
    setState: sinon.spy(),
    timeoutTimestamp: Date.now() - 1000,
    updateStateIfTimerReached: sinon.spy()
  };

  const updateStateIfTimerReached = component.createUpdateStateIfTimerReached(instance);

  t.is(typeof updateStateIfTimerReached, 'function');

  const timer = 123;

  const clearTimeoutStub = sinon.stub(global, 'clearTimeout');
  const setTimeoutStub = sinon.stub(global, 'setTimeout').returns(timer);

  updateStateIfTimerReached();

  t.true(clearTimeoutStub.calledOnce);
  t.true(clearTimeoutStub.calledWith(instance.updateStateIfTimerReached));

  clearTimeoutStub.restore();

  t.true(instance.setState.calledOnce);

  const setStateResult = instance.setState.firstCall.args[0]();

  t.true(setStateResult.isIdle);
  t.true(setStateResult.isTimedOut);
  t.is(setStateResult.timeoutIn, 0);

  t.is(instance.countdownTimeout, timer);

  t.true(setTimeoutStub.calledOnce);
  t.true(setTimeoutStub.calledWith(instance.updateStateIfTimerReached));

  setTimeoutStub.restore();
});

test('if getWrapComponent creates a function that wraps the component in a higher order PureComponent when isPure is true', (t) => {
  const options = {
    isPure: true
  };

  const wrapComponent = component.getWrapComponent(options);

  t.is(typeof wrapComponent, 'function');

  function Foo() {
    return <div/>;
  }

  const Result = wrapComponent(Foo);

  t.is(typeof Result, 'function');
  t.is(Object.getPrototypeOf(Result), React.PureComponent);
  t.is(Result.displayName, 'IdleManager(Foo)');

  const wrapper = shallow(
    <Result/>
  );

  t.is(wrapper.type(), Foo);

  t.snapshot(toJson(wrapper));
});

test('if getWrapComponent creates a function that wraps the component in a higher order Component when isPure is false', (t) => {
  const options = {
    isPure: false
  };

  const wrapComponent = component.getWrapComponent(options);

  t.is(typeof wrapComponent, 'function');

  function Foo() {
    return <div/>;
  }

  const Result = wrapComponent(Foo);

  t.is(Object.getPrototypeOf(Result), React.Component);
});
