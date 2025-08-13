/// <reference types="jest" />
import { SetTimeoutRequest } from '..';

describe('SetTimeoutRequest', () => {
  let setTimeoutRequest: SetTimeoutRequest = new SetTimeoutRequest();
  let mockFunction: () => void = jest.fn();
  let requestID: ReturnType<typeof setTimeout> = setTimeout(() => {}, 0);

  beforeEach(() => {
    jest.resetModules();
    setTimeoutRequest = new SetTimeoutRequest();
    mockFunction = jest.fn();
    requestID = setTimeout(() => {}, 0);
    jest.useFakeTimers();
  });

  it('выполняет запрос', () => {
    setTimeoutRequest.requestID = requestID;
    expect(setTimeoutRequest.requestID).toBe(requestID);
    setTimeoutRequest.request(mockFunction, 100);
    expect(setTimeoutRequest.requestID).toBe(1_000_000_000_000);
    jest.runAllTimers();

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('отменяет запрос', () => {
    setTimeoutRequest.requestID = requestID;
    expect(setTimeoutRequest.requestID).toBe(requestID);
    setTimeoutRequest.cancelRequest();
    expect(setTimeoutRequest.requestID).toBe(undefined);
  });

  it('устанавливает requestID', () => {
    setTimeoutRequest.requestID = requestID;
    expect(setTimeoutRequest.requestID).toBe(requestID);
  });

  it('получает requestID', () => {
    setTimeoutRequest.requestID = requestID;
    expect(setTimeoutRequest.requestID).toBe(requestID);
  });

  it('проверяет статус запроса', () => {
    setTimeoutRequest.request(mockFunction, 100);
    expect(setTimeoutRequest.requested).toBe(true);
  });
});
