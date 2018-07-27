// decorators
import {idleManager} from './idleManager';

// utils
import {getExistingCookieValues} from './utils';

export const getValues = (key) => getExistingCookieValues(key);

export default idleManager;
