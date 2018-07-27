// external dependencies
import Cookies from 'universal-cookie';
import React from 'react';
import {createComponent} from 'react-parm';
import statics from 'react-statics';
import uuid from 'uuid/v4';

// utils
import {getComponentName} from './utils';

export const WINDOW_ID = uuid();

export const onConstruct = (options) => (instance) => {
  const cookies = new Cookies();

  cookies.addChangeListener(instance.onChangeSetCookie);

  instance.state = {
    cookies,
  };
};

export const componentWillUnmount = ({onChangeSetCookie, state: {cookies}}) =>
  cookies.removeChangeListener(onChangeSetCookie);

export const onChangeSetCookie = (options) => (instance, [{name}]) => {
  console.log(name, options.key);

  return name === options.key && instance.forceUpdate();
};

export const cookieManager = (Component, options) => {
  const CookieManager = createComponent((props, {state: {cookies}}) => <Component {...props} cookies={cookies} />, {
    cookies: null,
    onChangeSetCookie: onChangeSetCookie(options),
    onConstruct: onConstruct(options),
  });

  return statics({
    displayName: `CookieManager(${getComponentName(Component)})`,
  })(CookieManager);
};
