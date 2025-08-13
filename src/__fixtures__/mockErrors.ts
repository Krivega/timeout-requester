import type { TError } from '../index';

const errorNotPossibleRequest: TError = new Error('request is not possible');

errorNotPossibleRequest.id = 'notPossibleRequest';

const errorFailedRequest: TError = new Error('request failed');

errorNotPossibleRequest.id = 'failedRequest';

export { errorNotPossibleRequest, errorFailedRequest };
