import DelayRequester from '../DelayRequester';
import { errorFailedRequest, errorNotPossibleRequest } from './mockErrors';
import mockRequestData from './mockRequestData';

export const onFail = jest.fn();
export const onBeforeStart = jest.fn();
export const onStop = jest.fn();
export const onSuccess = jest.fn();
export const onSuccessRequest = jest.fn();
export const requestSuccess = async () => {
  return mockRequestData;
};
export const requestFail = async () => {
  throw errorFailedRequest;
};
export const whenPossibleRequest = async () => {};
export const whenNotPossibleRequest = async () => {
  throw errorNotPossibleRequest;
};
export const requestInterval = 100;
export const hasIncreaseInterval = jest.fn(() => {
  return false;
});

export const delayedRequestSuccess = jest.fn(async () => {
  return new DelayRequester(requestInterval).request();
});
