// external dependencies
import PropTypes from 'prop-types';
import React, {
  PureComponent
} from 'react';

// src
import idleManager from '../src';

class AnotherDiv extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    isIdle: PropTypes.bool.isRequired,
    isTimedOut: PropTypes.bool.isRequired,
    timeoutIn: PropTypes.number
  };

  render() {
    const {
      children,
      isIdle,
      isTimedOut,
      timeoutIn
    } = this.props;

    return (
      <div>
        {children}

        {!isIdle && !isTimedOut && (
          <div>
            AnotherDiv is still active.
          </div>
        )}

        {isIdle && !isTimedOut && (
          <div>
            AnotherDiv will timeout in {Math.ceil(timeoutIn / 1000)} seconds.
          </div>
        )}

        {isTimedOut && (
          <div>
            AnotherDiv has timed out.
          </div>
        )}
      </div>
    );
  }
}

export default idleManager({idleAfter: 7000, timeOutAfter: 3000})(AnotherDiv);
