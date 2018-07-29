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

test('if createComponentDidMount will add the correct listeners', (t) => {
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
    setStateIfChanged() {},
  };

  const newIntervalId = 123;

  const cookiesStub = sinon.stub(cookies, 'erase');
  const setIntervalStub = sinon.stub(global, 'setInterval').returns(newIntervalId);
  const windowListenerStub = sinon.stub(window, 'addEventListener');

  idleManager.createComponentDidMount(options)(instance);

  t.true(cookiesStub.notCalled);

  cookiesStub.restore();

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

test('if createComponentDidMount will add the correct listeners when scoped', (t) => {
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
    setStateIfChanged() {},
  };

  const newIntervalId = 123;

  const cookiesStub = sinon.stub(cookies, 'erase');
  const setIntervalStub = sinon.stub(global, 'setInterval').returns(newIntervalId);
  const windowListenerStub = sinon.stub(window, 'addEventListener');

  idleManager.createComponentDidMount(options)(instance);

  t.true(cookiesStub.notCalled);

  cookiesStub.restore();

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

test('if createComponentDidMount will not add the correct listeners if disabled', (t) => {
  const options = {
    isDisabled: true,
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
    setStateIfChanged() {},
  };

  const newIntervalId = 123;

  const cookiesStub = sinon.stub(cookies, 'erase');
  const setIntervalStub = sinon.stub(global, 'setInterval').returns(newIntervalId);
  const windowListenerStub = sinon.stub(window, 'addEventListener');

  idleManager.createComponentDidMount(options)(instance);

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledWith(options.key));

  cookiesStub.restore();

  t.true(instance.element.addEventListener.notCalled);

  t.true(setIntervalStub.notCalled);

  setIntervalStub.restore();

  t.is(instance.intervalId, null);

  t.true(windowListenerStub.notCalled);

  windowListenerStub.restore();
});

test('if createComponentWillUnmount will remove all listeners and clear the interval', (t) => {
  const options = {
    isDisabled: false,
    isScoped: false,
    resetTimerEvents: ['click'],
  };
  const intervalId = 123;
  const instance = {
    componentWillUnmount() {},
    intervalId,
    setStateIfChanged() {},
  };

  const clearIntervalStub = sinon.stub(global, 'clearInterval');
  const windowListenerStub = sinon.stub(window, 'removeEventListener');

  idleManager.createComponentWillUnmount(options)(instance);

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

test('if createComponentWillUnmount will remove only unload listeners and clear the interval if disabled', (t) => {
  const options = {
    isDisabled: false,
    isScoped: true,
    resetTimerEvents: ['click'],
  };
  const intervalId = 123;
  const instance = {
    componentWillUnmount() {},
    intervalId,
    setStateIfChanged() {},
  };

  const clearIntervalStub = sinon.stub(global, 'clearInterval');
  const windowListenerStub = sinon.stub(window, 'removeEventListener');

  idleManager.createComponentWillUnmount(options)(instance);

  t.true(windowListenerStub.calledOnce);
  t.deepEqual(windowListenerStub.args[0], [constants.BEFORE_UNLOAD, instance.componentWillUnmount]);

  windowListenerStub.restore();

  t.true(clearIntervalStub.calledOnce);
  t.true(clearIntervalStub.calledWith(intervalId));

  clearIntervalStub.restore();

  t.is(instance.intervalId, null);
});

test('if createComponentWillUnmount will not remove all listeners or clear the interval if disabled', (t) => {
  const options = {
    isDisabled: true,
    isScoped: false,
    resetTimerEvents: ['click'],
  };
  const intervalId = 123;
  const instance = {
    componentWillUnmount() {},
    intervalId,
    setStateIfChanged() {},
  };

  const clearIntervalStub = sinon.stub(global, 'clearInterval');
  const windowListenerStub = sinon.stub(window, 'removeEventListener');

  idleManager.createComponentWillUnmount(options)(instance);

  t.true(windowListenerStub.notCalled);

  windowListenerStub.restore();

  t.true(clearIntervalStub.notCalled);

  clearIntervalStub.restore();

  t.is(instance.intervalId, intervalId);
});

test('if createSetStateIfChanged will set the state if it should', (t) => {
  const now = 123456789000;
  const nowStub = sinon.stub(constants, 'getNow').returns(now);

  const options = {
    ...constants.DEFAULT_OPTIONS,
    key: 'key',
  };
  const instance = {
    setState: sinon.stub().callsFake((fn) => {
      const result = fn();

      instance.state = utils.getFreshState(options);

      t.deepEqual(result, instance.state);
    }),
    state: {},
  };

  const event = new Event('click');

  const shouldSetStateStub = sinon.stub(utils, 'shouldSetState').returns(true);
  const setValuesStub = sinon.stub(utils, 'setCookieValues');

  idleManager.createSetStateIfChanged(options)(instance, [event]);

  nowStub.restore();

  t.true(shouldSetStateStub.calledOnce);

  shouldSetStateStub.restore();

  t.true(instance.setState.calledOnce);

  t.true(setValuesStub.calledOnce);
  t.deepEqual(setValuesStub.args[0], [options, instance.state]);

  setValuesStub.restore();
});

test('if createSetStateIfChanged will not set the state if it should not', (t) => {
  const now = 123456789000;
  const nowStub = sinon.stub(constants, 'getNow').returns(now);

  const options = {
    ...constants.DEFAULT_OPTIONS,
    key: 'key',
  };
  const instance = {
    setState: sinon.stub().callsFake((fn) => {
      const result = fn();

      instance.state = utils.getFreshState(options);

      t.deepEqual(result, instance.state);
    }),
    state: {},
  };

  const event = new Event('click');

  const shouldSetStateStub = sinon.stub(utils, 'shouldSetState').returns(false);
  const setValuesStub = sinon.stub(utils, 'setCookieValues');

  idleManager.createSetStateIfChanged(options)(instance, [event]);

  nowStub.restore();

  t.true(shouldSetStateStub.calledOnce);

  shouldSetStateStub.restore();

  t.true(instance.setState.notCalled);

  t.true(setValuesStub.notCalled);

  setValuesStub.restore();
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
