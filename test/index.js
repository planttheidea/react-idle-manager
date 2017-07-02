// test
import test from 'ava';
import sinon from 'sinon';

// src
import * as index from 'src/index';
import * as constants from 'src/constants';
import * as getWrapComponent from 'src/IdleManager';

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
