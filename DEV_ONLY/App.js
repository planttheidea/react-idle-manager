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
  marginBottom: 15
};

console.log(getValues(APP_KEY));

class App extends PureComponent {
  static propTypes = {
    isIdle: PropTypes.bool.isRequired,
    isTimedOut: PropTypes.bool.isRequired,
    timeoutIn: PropTypes.number
  };

  render() {
    const {isIdle, isTimedOut, timeoutIn} = this.props;

    console.log(isIdle, timeoutIn);

    return (
      <div>
        <h1>App</h1>

        <div style={APP_IDLE_STYLE}>
          {!isIdle && !isTimedOut && <div>App is still active.</div>}

          {isIdle &&
            !isTimedOut &&
            <div>
              App will timeout in {Math.ceil(timeoutIn / 1000)} seconds.
            </div>}

          {isTimedOut && <div>App has timed out.</div>}
        </div>

        <AnotherDiv>I am another div, with a separate timer!</AnotherDiv>
      </div>
    );
  }
}

export default idleManager({
  idleAfter: 1000,
  key: APP_KEY,
  timeOutAfter: 1200000
})(App);
// export default idleManager(APP_KEY)(App);
