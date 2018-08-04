# react-idle-manager CHANGELOG

## 2.1.0

- Add [`updateIdleManagerOptions`](README.md#updateidlemanageroptions) prop to allow dynamic updates of manager options
- Fix issue where `cookies.erase` was not being called with `storageOptions`

## 2.0.0

#### BREAKING CHANGES

- Uses first-party cookies for storage instead of `localStorage` (to allow for use across subdomains)
- `timeOutAfter` has been changed to `timeoutAfter`

#### NEW FEATURES

- Wrapped component now receices `idleIn` as prop
- `getValues` now returns the current idle / timeout timestamps
- Can programmatically disable using [`configuration.isDisabled`](README.md#isdisabled)
- Can scope event listening to component wrapped instead of entire `window` using [`configuration.isScoped`](README.md#isscoped)
- Can provide options for how values are persistently stored using [`configuration.storageOptions`](README.md#storageoptions)
- Can customize the events observed for resetting the timer using [`configuration.resetTimerEvents`](README.md#resettimerevents)
- Can customize the frequency of polling for new state using [`configuration.pollInterval`](README.md#pollinterval)

## 1.1.1

- Add `react` 16 support
- Make `react` an explicit dependency

## 1.1.0

- Add `getValues` method to retrieve the values for a specific key outside of
- Add `es` transpilation in addition to standard `lib`, preserving ES2015 modules for [`pkg.module`](https://github.com/rollup/rollup/wiki/pkg.module)

## 1.0.3

- Fix countdown always running instead of only running when idle

## 1.0.2

- Fix cross-tab communication issue

## 1.0.1

- **BAD PUBLISH, DO NOT USE THIS VERSION**

## 1.0.0

- Initial release
