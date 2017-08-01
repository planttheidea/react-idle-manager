// test
import test from 'ava';
import sinon from 'sinon';

// src
import * as index from 'src/index';
import * as constants from 'src/constants';
import * as getWrapComponent from 'src/IdleManager';
import * as utils from 'src/utils';

test.serial('if getValues returns null if getLocalStorageValues returns null', (t) => {
  const key = 'foo';
  const localStorageValues = null;
  const currentStateValues = {bar: 'baz'};

  const getLocalStorageValuesStub = sinon.stub(utils, 'getLocalStorageValues').returns(localStorageValues);
  const getCurrentStateStub = sinon.stub(utils, 'getCurrentState').returns(JSON.stringify(currentStateValues));

  const result = index.getValues(key);

  t.true(getLocalStorageValuesStub.calledOnce);
  t.true(getLocalStorageValuesStub.calledWith(key));

  t.true(getCurrentStateStub.notCalled);

  t.is(result, localStorageValues);

  getLocalStorageValuesStub.restore();
  getCurrentStateStub.restore();
});

test.serial('if getValues returns the current state if getLocalStorageValues returns values', (t) => {
  const key = 'foo';
  const now = Date.now();

  const localStorageValues = {
    idleAfter: now + 1000,
    timeOutAfter: now + 2000
  };
  const currentStateValues = {bar: 'baz'};

  const getLocalStorageValuesStub = sinon
    .stub(utils, 'getLocalStorageValues')
    .returns(JSON.stringify(localStorageValues));
  const getCurrentStateStub = sinon.stub(utils, 'getCurrentState').returns(currentStateValues);

  const result = index.getValues(key);

  t.true(getLocalStorageValuesStub.calledOnce);
  t.true(getLocalStorageValuesStub.calledWith(key));

  t.true(getCurrentStateStub.calledOnce);

  t.is(result, currentStateValues);

  getLocalStorageValuesStub.restore();
  getCurrentStateStub.restore();
});

test('if idleManager is the same as the default export', (t) => {
  t.is(typeof index.idleManager, 'function');
  t.is(index.idleManager, index.default);
});

test('if idleManager will call getWrapComponent with the default options with the key when options is a string', (t) => {
  const options = 'foo';

  const getWrapComponentStub = sinon.stub(getWrapComponent, 'default');

  index.idleManager(options);

  t.true(getWrapComponentStub.calledOnce);
  t.deepEqual(getWrapComponentStub.firstCall.args, [
    {
      ...constants.DEFAULT_OPTIONS,
      key: options
    }
  ]);

  getWrapComponentStub.restore();
});

test('if idleManager will call getWrapComponent with the merged options when options is an object', (t) => {
  const options = {
    foo: 'bar'
  };

  const getWrapComponentStub = sinon.stub(getWrapComponent, 'default');

  index.idleManager(options);

  t.true(getWrapComponentStub.calledOnce);
  t.deepEqual(getWrapComponentStub.firstCall.args, [
    {
      ...constants.DEFAULT_OPTIONS,
      ...options
    }
  ]);

  getWrapComponentStub.restore();
});

test('if idleManager will throw an error when options is not a string or plain object', (t) => {
  const options = 123;

  const error = t.throws(() => {
    index.idleManager(options);
  }, TypeError);

  t.is(error.message, constants.INVALID_OPTIONS_ERROR_MESSAGE);
});
