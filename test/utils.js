/* eslint-disable no-magic-numbers */

// test
import test from 'ava';
import cookies from 'browser-cookies';
import sinon from 'sinon';

// src
import * as utils from 'src/utils';
import * as constants from 'src/constants';

test.serial('if getExistingCookieValues will parse the cookies returned from get', (t) => {
  const cookieValue = JSON.stringify({some: 'thing'});
  const cookiesStub = sinon.stub(cookies, 'get').returns(cookieValue);

  const key = 'key';

  const result = utils.getExistingCookieValues(key);

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledWith(key));

  cookiesStub.restore();

  t.deepEqual(result, {some: 'thing'});
});

test.serial('if getExistingCookieValues will return an empty object if no match is found', (t) => {
  const cookiesStub = sinon.stub(cookies, 'get').returns(null);

  const key = 'key';

  const result = utils.getExistingCookieValues(key);

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledWith(key));

  cookiesStub.restore();

  t.deepEqual(result, {});
});

test('if getCalculatedNewState will calculate the state correctly based on the current state', (t) => {
  const options = {key: 'key'};

  const now = 123456789000;
  const getNowStub = sinon.stub(constants, 'getNow').returns(now);

  const state = {
    idleTimestamp: now + 1000,
    timeoutTimestamp: now + 2000,
  };

  const cookiesStub = sinon.stub(cookies, 'get').returns(null);

  const result = utils.getCalculatedNewState(options, state);

  t.true(getNowStub.calledOnce);

  getNowStub.restore();

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledWith(options.key));

  cookiesStub.restore();

  t.deepEqual(result, {
    idleIn: state.idleTimestamp - now,
    idleTimestamp: state.idleTimestamp,
    isIdle: false,
    isTimedOut: false,
    timeoutIn: state.timeoutTimestamp - now,
    timeoutTimestamp: state.timeoutTimestamp,
  });
});

test('if getCalculatedNewState will calculate the state correctly based on the value from cookies', (t) => {
  const options = {key: 'key'};

  const now = 123456789000;
  const getNowStub = sinon.stub(constants, 'getNow').returns(now);

  const state = {
    idleTimestamp: now + 1000,
    timeoutTimestamp: now + 2000,
  };

  const cookieValue = {
    idleTimestamp: now - 2000,
    timeoutTimestamp: now - 1000,
  };
  const cookiesStub = sinon.stub(cookies, 'get').returns(JSON.stringify(cookieValue));

  const result = utils.getCalculatedNewState(options, state);

  t.true(getNowStub.calledOnce);

  getNowStub.restore();

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledWith(options.key));

  cookiesStub.restore();

  t.deepEqual(result, {
    idleIn: 0,
    idleTimestamp: cookieValue.idleTimestamp,
    isIdle: true,
    isTimedOut: true,
    timeoutIn: 0,
    timeoutTimestamp: cookieValue.timeoutTimestamp,
  });
});

test('if getCalculatedTimestamps will calculate the timestamps based on now', (t) => {
  const options = {
    idleAfter: 1000,
    timeoutAfter: 2000,
  };

  const now = 123456789000;
  const getNowStub = sinon.stub(constants, 'getNow').returns(now);

  const result = utils.getCalculatedTimestamps(options);

  t.true(getNowStub.calledOnce);

  getNowStub.restore();

  t.deepEqual(result, {
    idleAfter: options.idleAfter,
    idleTimestamp: now + options.idleAfter,
    timeoutAfter: options.timeoutAfter,
    timeoutTimestamp: now + options.idleAfter + options.timeoutAfter,
  });
});

test('if getCalculatedTimestamps will calculate the timestamps based on now and defaults', (t) => {
  const options = {};

  const now = 123456789000;
  const getNowStub = sinon.stub(constants, 'getNow').returns(now);

  const result = utils.getCalculatedTimestamps(options);

  t.true(getNowStub.calledOnce);

  getNowStub.restore();

  t.deepEqual(result, {
    idleAfter: constants.DEFAULT_OPTIONS.idleAfter,
    idleTimestamp: now + constants.DEFAULT_OPTIONS.idleAfter,
    timeoutAfter: constants.DEFAULT_OPTIONS.timeoutAfter,
    timeoutTimestamp: now + constants.DEFAULT_OPTIONS.idleAfter + constants.DEFAULT_OPTIONS.timeoutAfter,
  });
});

test('if getFunctionNameViaRegexp will get the function name if it can be derived', (t) => {
  function Foo() {}

  const namedResult = utils.getFunctionNameViaRegexp(Foo);

  t.is(namedResult, 'Foo');
});

test('if getFunctionNameViaRegexp will return an empty string when the function name cannot be derived', (t) => {
  const anonymousResult = utils.getFunctionNameViaRegexp(function() {}); //eslint-disable-line prefer-arrow-callback

  t.is(anonymousResult, '');

  const invalidResult = utils.getFunctionNameViaRegexp('foo');

  t.is(invalidResult, '');
});

test('if getComponentName returns the name if it exists as displayName', (t) => {
  function Foo() {}

  Foo.displayName = 'Bar';

  const displayNameResult = utils.getComponentName(Foo);

  t.is(displayNameResult, Foo.displayName);
});

test('if getComponentName returns the name if it exists as name', (t) => {
  function Foo() {}

  const namedResult = utils.getComponentName(Foo);

  t.is(namedResult, 'Foo');
});

test('if getComponentName returns the name if it can be derived', (t) => {
  function Foo() {}

  delete Foo.name;

  const unnamedResult = utils.getComponentName(Foo);

  t.is(unnamedResult, 'Foo');
});

test('if getComponentName returns "Component" as an ultimate fallback', (t) => {
  const lamdaResult = utils.getComponentName(() => {});

  t.is(lamdaResult, 'Component');
});

test('if getNormalizedOptions will merge options with the defaults', (t) => {
  const options = {key: 'key'};

  const result = utils.getNormalizedOptions(options);

  t.deepEqual(result, {
    ...constants.DEFAULT_OPTIONS,
    ...options,
  });
});

test('if setCookieValues will call cookies.set with the correct values', (t) => {
  const options = {
    key: 'key',
    storageOptions: 'storageOptions',
  };
  const state = {
    idleTimestamp: 12345,
    timeoutTimestamp: 23456,
  };

  const cookiesStub = sinon.stub(cookies, 'set');

  utils.setCookieValues(options, state);

  t.true(cookiesStub.calledOnce);
  t.deepEqual(cookiesStub.args[0], [options.key, JSON.stringify(state), options.storageOptions]);

  cookiesStub.restore();
});

test('if getFreshState will set the timestamps in cookies and return a fresh state object', (t) => {
  const options = {
    idleAfter: 1000,
    key: 'key',
    storageOptions: 'storageOptions',
    timeoutAfter: 2000,
  };

  const now = 123456789000;
  const getNowStub = sinon.stub(constants, 'getNow').returns(now);
  const cookiesStub = sinon.stub(cookies, 'set');

  const result = utils.getFreshState(options);

  t.true(cookiesStub.calledOnce);
  t.deepEqual(cookiesStub.args[0], [
    options.key,
    JSON.stringify({
      idleTimestamp: now + options.idleAfter,
      timeoutTimestamp: now + options.idleAfter + options.timeoutAfter,
    }),
    options.storageOptions,
  ]);

  cookiesStub.restore();

  t.deepEqual(result, {
    idleIn: options.idleAfter,
    idleTimestamp: now + options.idleAfter,
    isIdle: false,
    isTimedOut: false,
    timeoutIn: options.idleAfter + options.timeoutAfter,
    timeoutTimestamp: now + options.idleAfter + options.timeoutAfter,
  });
});

test('if shouldSetState will return true if is idle and was not idle', (t) => {
  const newState = {
    isIdle: true,
    isTimedOut: false,
    timeoutIn: 1000,
  };
  const currentState = {
    isIdle: false,
    isTimedOut: false,
    timeoutIn: 1000,
  };

  t.true(utils.shouldSetState(newState, currentState));
});

test('if shouldSetState will return true if is idle and isTimedOut has changed', (t) => {
  const newState = {
    isIdle: true,
    isTimedOut: true,
    timeoutIn: 0,
  };
  const currentState = {
    isIdle: true,
    isTimedOut: false,
    timeoutIn: 1000,
  };

  t.true(utils.shouldSetState(newState, currentState));
});

test('if shouldSetState will return true if is idle and timeoutIn has changed', (t) => {
  const newState = {
    isIdle: true,
    isTimedOut: false,
    timeoutIn: 1000,
  };
  const currentState = {
    isIdle: true,
    isTimedOut: false,
    timeoutIn: 2000,
  };

  t.true(utils.shouldSetState(newState, currentState));
});

test('if shouldSetState will return true if is not idle and was idle', (t) => {
  const newState = {
    isIdle: false,
    isTimedOut: false,
    timeoutIn: 1000,
  };
  const currentState = {
    isIdle: true,
    isTimedOut: false,
    timeoutIn: 1000,
  };

  t.true(utils.shouldSetState(newState, currentState));
});

test('if shouldSetState will return false if is idle, timed out, and timeout in has not changed', (t) => {
  const newState = {
    isIdle: true,
    isTimedOut: false,
    timeoutIn: 1000,
  };
  const currentState = {
    isIdle: true,
    isTimedOut: false,
    timeoutIn: 1000,
  };

  t.false(utils.shouldSetState(newState, currentState));
});
