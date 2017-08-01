# react-idle-manager

A decorator for React components that notifies of idle and timed-out states

## Table of contents
* [Summary](#summary)
* [Usage](#usage)
* [Props injected](#props-injected)
  * [isIdle](#isidle)
  * [isTimedOut](#istimedout)
  * [timeoutIn](#timeoutin)
* [Required values](#required-values)
  * [key](#key)
* [Options](#options)
  * [idleAfter](#idleafter)
  * [isPure](#ispure)
  * [timeoutAfter](#timeoutafter)
* [Utilities](#utilities)
  * [getValues](#getvalues)
* [Development](#development)

## Installation

```
$ npm i react-idle-manager --save
```

## Summary

This decorator wraps whatever `React` component you apply it to with a higher-order component that will supply idle state and timeout state information to the component via `props`. It leverages `localStorage` to ensure that the idle state is respected between multiple tab instances, and will handle multiple unique instances based on the `key`s passed.

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

const IDLE_MANAGER_OPTIONS = {
  key: 'my-super-awesome-app',
  idleAfter: 50000,
  isPure: false,
  timeoutAfter: 10000
};

@idleManager(IDLE_MANAGER_OPTIONS)
class App extends React.PureComponent {
  ...
}
```

Set the list of available [options](#options) below.

## Props injected

When the `idleManager` decorator is applied to a component, the following props will be passed to the component:

#### isIdle

*boolean*

Is the component currently considered idle.

#### isTimedOut

*boolean*

Is the component currently considered timed ONE_MINUTE

#### timeoutIn

*(null|number)*

If the component is in an idle state, the number of milliseconds until the component will time out is passed. If the component is not idle, `null` is passed.

This number is updated for every second between the start of idle state and when timeout state is reached, providing a countdown until timeout.
* The number of milliseconds may not update in exact 1 second intervals, due to the nature of `setTimeout`. If you want to provide a clean count of the number of seconds, you can do `Math.ceil(timeoutIn / 1000)`.
* If you do not want to provide this timeout, pass the [`timeoutAfter`](#timeoutafter) option value of `0`.

## Required values

#### key

*string*

The key to use in `localStorage` for storage of when idle and timeout states are reached. This value can either be passed as the only parameter to the decorator, or as a property on the object of [options](#options).

Please note that if the same key is used for multiple components, there may be collision of specific time states, so make the keys consistent but specific to each implementation.

It is recommended to follow the format `${uniqueAppName}_${componentName}`:

```javascript
@idleManager('planttheidea-idle-manager-demo_App')
class App extends PureComponent {
  ...
}
```

## Options

#### idleAfter

*number (defaults to 840000, or 14 minutes in milliseconds)*

The number of milliseconds since activity that the component is considered in idle state.

#### isPure

*boolean (defaults to `true`)*

Should `PureComponent` be used as the basis of the higher-order component the decorator creates. If `false` is passed, the standard `Component` class is used.

#### timeoutAfter

*number (defaults to 60000, or 1 minute in milliseconds)*

The number of milliseconds since idle state was reached that the component is considered in timeout state.

Please note that if a custom `idleAfter` is provided but no custom `timeoutAfter` is provided, timeout is assumed to be 1 minute later than `idleAfter`. If you do not want a distinction between idle and timeout state, simply pass `0` as the value for `timeoutAfter`.

## utilities

#### getvalues

Convenience method that will retrieve the state for the key passed based on existing values. This is helpful if you want to perform an action based on the state prior to a component's mount.

```javascript
import {
  getValues
} from 'react-idle-manager';

const currentState = getValues('planttheidea-idle-manager-demo_App');

console.log(currentState); // {isIdle: true, isTimedOut: false, timeoutIn: 46}
```

## Development

Standard stuff, clone the repo and `npm i` to get the dependencies. npm scripts available:
* `build` => builds the distributed JS with `NODE_ENV=development` and with sourcemaps
* `build:minified` => builds the distributed JS with `NODE_ENV=production` and minified
* `clean` => removes the `lib` and `dist` folders created during publish
* `dev` => runs the webpack dev server for the playground
* `lint` => runs ESLint against files in the `src` folder
* `lint:fix` => runs ESLint against files in the `src` folder and fixes any fixable issues discovered
* `prepublish` => if in publish, runs `prepublish:compile`
* `prepublish:compile` => runs the `lint`, `test`, `transpile`, `dist` scripts
* `test` => run `ava` with NODE_ENV=test
* `test:coverage` => run `ava` with `nyc` to calculate code coverage
* `test:update` => runs `test` but updates all snapshots
* `test:watch` => runs `test` but with persistent watcher
* `transpile` => runs Babel against files in `src` to files in `lib`
