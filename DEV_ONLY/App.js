// external dependencies
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

// components
import AnotherDiv from './AnotherDiv';

// src
import idleManager, {getValues} from '../src';

const APP_KEY = 'planttheidea-idle-manager-demo_App';
const APP_IDLE_STYLE = {
  border: '1px solid black',
  marginBottom: 15,
};

console.log(getValues(APP_KEY));
console.log(getValues('foo'));

setTimeout(() => console.log(getValues(APP_KEY)), 1000);

class App extends PureComponent {
  static propTypes = {
    idleIn: PropTypes.number.isRequired,
    isIdle: PropTypes.bool.isRequired,
    isTimedOut: PropTypes.bool.isRequired,
    timeoutIn: PropTypes.number.isRequired,
    updateIdleManagerOptions: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.updateIdleManagerOptions({
      idleAfter: 10000,
    });
  }

  render() {
    const {idleIn, isIdle, isTimedOut, timeoutIn} = this.props;

    console.group('App');
    console.log('idleIn', idleIn);
    console.log('isIdle', isIdle);
    console.log('isTimedOut', isTimedOut);
    console.log('timeoutIn', timeoutIn);
    console.groupEnd();

    return (
      <div>
        <h1>App</h1>

        <div style={APP_IDLE_STYLE}>
          {!isIdle && !isTimedOut && <div>App is still active.</div>}

          {isIdle && !isTimedOut && <div>App will timeout in {Math.ceil(timeoutIn / 1000)} seconds.</div>}

          {isTimedOut && <div>App has timed out.</div>}
        </div>

        <AnotherDiv>I am another div, with a separate timer!</AnotherDiv>
      </div>
    );
  }
}

export default idleManager({
  idleAfter: 2000,
  // isDisabled: true,
  key: APP_KEY,
  // resetTimerEvents: ['click'],
  storageOptions: {
    // domain: '.localhost',
    expires: 1,
    // httponly: true,
    // samesite: 'Strict',
    // secure: true,
  },
  timeoutAfter: 5000,
})(App);
// export default idleManager(APP_KEY)(App);
