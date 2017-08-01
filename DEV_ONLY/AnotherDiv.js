// external dependencies
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

// src
import idleManager from '../src';

const IDLE_MANAGER_OPTIONS = {
  key: 'planttheidea-idle-manager-demo_AnotherDiv',
  idleAfter: 7000,
  timeOutAfter: 3000
};

class AnotherDiv extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    isIdle: PropTypes.bool.isRequired,
    isTimedOut: PropTypes.bool.isRequired,
    timeoutIn: PropTypes.number
  };

  render() {
    const {children, isIdle, isTimedOut, timeoutIn} = this.props;

    return (
      <div>
        {children}

        {!isIdle && !isTimedOut && <div>AnotherDiv is still active.</div>}

        {isIdle &&
          !isTimedOut &&
          <div>
            AnotherDiv will timeout in {Math.ceil(timeoutIn / 1000)} seconds.
          </div>}

        {isTimedOut && <div>AnotherDiv has timed out.</div>}
      </div>
    );
  }
}

export default idleManager(IDLE_MANAGER_OPTIONS)(AnotherDiv);
