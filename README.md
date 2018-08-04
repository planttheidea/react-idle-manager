# react-idle-manager

A decorator for React components that notifies of idle and timed-out states

## Table of contents

- [Summary](#summary)
- [Usage](#usage)
- [Props injected](#props-injected)
  - [idleIn](#idlein)
  - [isIdle](#isidle)
  - [isTimedOut](#istimedout)
  - [timeoutIn](#timeoutin)
  - [updateIdleManagerOptions](#updateidlemanageroptions)
- [Configuration](#configuration)
  - [key](#key)
  - [idleAfter](#idleafter)
  - [isPure](#ispure)
  - [isScoped](#isscoped)
  - [pollInterval](#pollinterval)
  - [resetTimerEvents](#resettimerevents)
  - [storageOptions](#storageoptions)
  - [timeoutAfter](#timeoutafter)
- [Utilities](#utilities)
  - [getValues](#getvalues)
- [Development](#development)

## Installation

```
$ npm i react-idle-manager --save
```

## Summary

This decorator wraps whatever `React` component you apply it to with a higher-order component that will supply idle state and timeout state information to the component via `props`. It leverages first-party cookies to ensure that the idle state is respected between multiple tab instances (even across subdomains, if desired), and will handle multiple unique instances based on the `key`s passed.

## Usage

Basic usage:

```javascript
import React from 'react';
import idleManager from 'react-idle-manager';

@idleManager('my-super-awesome-app')
class App extends React.PureComponent {
  ...
}
```

Advanced usage:

```javascript
import React from 'react';
import idleManager from 'react-idle-manager';

@idleManager({
  key: 'my-super-awesome-app',
  idleAfter: 50000,
  isPure: false,
  timeoutAfter: 10000
})
class App extends Component {
  ...
}
```

Set the list of available [configuration options](#configuration) below.

## Props injected

When the `idleManager` decorator is applied to a component, additional props are passed to the component which provides information related to idle / timeout state.

Even though internally this data is constantly updating, for performance reasons the only time the props` will be updated are when the following conditions are met:

- The component is idle and was not prior
- The component timeout countdown value has changed
- The component has timed out but was not prior
- The component is not idle and was prior
- The component is not timed out but was prior

The following props will be passed to the component:

#### idleIn

_number_: The number of milliseconds until the component will be idle.

#### isIdle

_boolean_: Is the component currently idle.

#### isTimedOut

_boolean_: Is the component currently timed-out.

#### timeoutIn

_number_: The number of milliseconds until the component will time out.

- The number of milliseconds may not update in exact intervals compared to `configuration.pollInterval` due to the nature of `setTimeout`.
  - If you want to provide a clean count of the number of seconds, you can do something like `Math.ceil(timeoutIn / 1000)`.

#### updateIdleManagerOptions

_function(Object)_: A method to dynamically update all options passed in the decorator (except for the `key`).

```javascript
this.props.updateIdleManagerOptions({
  idleAfter: 1000 * 60 * 5,
  timeoutAfter: 1000 * 30
});
```

- This method is also available on the component instance retrieved via `ref`.

## Configuration

#### key

`string` _(required)_

The key to use in cookies for storage of when idle and timeout states are reached. This value can either be passed as the only parameter to the decorator, or as a property on the [configuration object](#configuration).

```javascript
@idleManager('planttheidea-idle-manager-demo_App')
class App extends Component {
  ...
}

// or

@idleManager({
  key: 'planttheidea-idle-manager-demo_App',
})
class App extends Component {
```

**NOTE**: If the same key is used for multiple components, there may be collision of specific time states, so make the keys consistent but specific to each implementation. An example format would be `${uniqueAppName}_${componentName}`:

#### idleAfter

`number` (defaults to `840000`, or 14 minutes in milliseconds)

The number of milliseconds since activity that the component is considered in idle state.

#### isPure

`boolean` (defaults to `true`)

Should `PureComponent` be used as the basis of the higher-order component the decorator creates. If `false` is passed, the standard `Component` class is used.

#### isScoped

`boolean` (defaults to `false`)

Should the `resetTimerEvents` be applied to the element of the wrapped component itself instead of the `window`.

#### pollInterval

`boolean` (defaults to `1000`, or 1 second in milliseconds)

The number of milliseconds to poll for external changes to stored idle timeout values.

#### resetTimerEvents

`Array<string>` (defaults to `['click', 'keydown', 'mousemove', 'scroll']`)

The events to add listeners for that will reset the idle state timer internally.

#### storageOptions

`Object`

The options to pass through to the cookie manager when storing the values. This can be used for more secure usage, for allowing sharing across multiple subdomains, or more fine-grained implementation.

The shape of the options available:

```javascript
{
  // the domain from where the cookie is readable
  domain: string = '',
  // when the cookie will expire
  expires: (Date|number|string) = 0,
  // is the cookie only able to be read by the server
  httponly: boolean = false,
  // the path where the cookie is readable from
  path: string = '/',
  // SameSite setting for if the cookie should be sent with CORS requests
  samesite: string = '',
  // is the cookie only usable on secure protocols like https
  secure: boolean = false,
}
```

For more detailed information, including valid values and support limitations for certain options, [check the cookie manager documentation](https://github.com/voltace/browser-cookies#options).

#### timeoutAfter

`number` (defaults to `60000`, or 1 minute in milliseconds)

The number of milliseconds until the component is considered in timeout state.

**NOTE**: This number is _in addition to `idleAfter`_, meaning if you want the overarching timeout to be 5 seconds but be considered idle after 2 seconds, you would provide `idleAfter` of `2000` and `timeoutAfter` of `3000`. If you do not want a distinction between beginning of idle state and timed-out state, pass `timeoutAfter` of `0`.

## utilities

#### getValues

`getValues(key: string): (Object|null)`

Convenience method that will retrieve the state for the key passed based on existing values. This is helpful if you want to perform an action based on the state prior to a component's mount.

```javascript
import { getValues } from "react-idle-manager";

const currentState = getValues("planttheidea-idle-manager-demo_App");

console.log(currentState);
/*
{
  idleIn: 1701, 
  idleTimestamp: 1532834828078, 
  isIdle: false, 
  isTimedOut: false, 
  timeoutIn: 6701,
  timeoutTimestamp: 1532834833078
}
*/
```

**NOTE**: If there is no matching `key` found, `null` is returned.

## Development

Standard stuff, clone the repo and `npm i` to get the dependencies. npm scripts available:

- `build` => builds the distributed JS with `NODE_ENV=development` and with sourcemaps
- `dev` => runs the webpack dev server for the playground
- `lint` => runs ESLint against files in the `src` folder
- `lint:fix` => runs ESLint against files in the `src` folder and fixes any fixable issues discovered
- `prepublish` => if in publish, runs `prepublish:compile`
- `prepublish:compile` => runs the `lint`, `test`, `transpile`, `dist` scripts
- `test` => run `ava` with NODE_ENV=test
- `test:coverage` => run `ava` with `nyc` to calculate code coverage
- `test:update` => runs `test` but updates all snapshots
- `test:watch` => runs `test` but with persistent watcher
- `transpile:es` => run babel against all files in `src` to create files in `es`, preserving ES2015 modules (for
  [`pkg.module`](https://github.com/rollup/rollup/wiki/pkg.module))
- `transpile:lib` => runs Babel against files in `src` to files in `lib`
