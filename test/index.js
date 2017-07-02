// test
import test from 'ava';
import sinon from 'sinon';

// src
import * as index from 'src/index';
import * as constants from 'src/constants';
import * as getWrapComponent from 'src/IdleManager';

test('if idleManager will call getWrapComponent with the default options and the function passed when options is a function', (t) => {
  const options = () => {};

  const wrapComponentStub = sinon.stub();
  const getWrapComponentStub = sinon.stub(getWrapComponent, 'default').returns(wrapComponentStub);

  index.idleManager(options);

  t.true(getWrapComponentStub.calledOnce);
  t.true(getWrapComponentStub.calledWith(constants.DEFAULT_OPTIONS));

  t.true(wrapComponentStub.calledOnce);
  t.true(wrapComponentStub.calledWith(options));

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

test('if idleManager will throw an error when options is not a plain object', (t) => {
  const options = 'foo';

  t.throws(() => {
    index.idleManager(options);
  }, TypeError);
});
