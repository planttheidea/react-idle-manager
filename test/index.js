// test
import test from 'ava';
import cookies from 'browser-cookies';
import sinon from 'sinon';

// src
import * as index from 'src/index';
import * as constants from 'src/constants';
import * as idleManager from 'src/idleManager';
import * as utils from 'src/utils';
import {getExistingCookieValues} from '../src/utils';

test('if the default export is idleMananger', (t) => {
  t.is(index.default, idleManager.idleManager);
});

test('if getValues will return null if the key does not exist', (t) => {
  const key = 'key';

  const state = {some: 'state'};
  const cookiesStub = sinon.stub(cookies, 'get').returns(null);
  const getStateStub = sinon.stub(utils, 'getCalculatedNewState').returns(state);

  const result = index.getValues(key);

  t.true(cookiesStub.calledOnce);
  t.true(cookiesStub.calledWith(key));

  cookiesStub.restore();

  t.true(getStateStub.notCalled);

  getStateStub.restore();

  t.is(result, null);
});

test('if getValues will return the state if the key exists', (t) => {
  const key = 'key';

  const state = {some: 'state'};
  const cookiesStub = sinon.stub(cookies, 'get').returns(JSON.stringify(state));
  const getStateStub = sinon.stub(utils, 'getCalculatedNewState').returns(state);

  const result = index.getValues(key);

  t.true(cookiesStub.calledTwice);
  t.deepEqual(cookiesStub.args, [[key], [key]]);

  cookiesStub.restore();

  t.true(getStateStub.calledOnce);
  t.deepEqual(getStateStub.args[0], [{key}, state]);

  getStateStub.restore();

  t.deepEqual(result, state);
});
