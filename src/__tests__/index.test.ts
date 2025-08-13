/// <reference types="jest" />
import * as TimeoutRequester from '../index';

describe('экспорты из index', () => {
  it('должен экспортировать все ожидаемые функции и классы', () => {
    expect(typeof TimeoutRequester.cancelableDelayPromise).toBe('function');
    expect(typeof TimeoutRequester.DelayRequester).toBe('function');
    expect(typeof TimeoutRequester.hasCanceledError).toBe('function');
    expect(typeof TimeoutRequester.requesterByTimeoutsWithFailCalls).toBe('function');
    expect(typeof TimeoutRequester.resolveRequesterByTimeout).toBe('function');
    expect(typeof TimeoutRequester.resolveRequesterByTimeoutWhenPossible).toBe('function');
    expect(typeof TimeoutRequester.SetTimeoutRequest).toBe('function');
  });

  it('должен создавать экземпляры экспортированных классов', () => {
    const delayRequester = new TimeoutRequester.DelayRequester(100);
    const setTimeoutRequest = new TimeoutRequester.SetTimeoutRequest();

    expect(delayRequester).toBeInstanceOf(TimeoutRequester.DelayRequester);
    expect(setTimeoutRequest).toBeInstanceOf(TimeoutRequester.SetTimeoutRequest);
  });

  it('должен вызывать экспортированные функции', async () => {
    const cancelablePromise = TimeoutRequester.cancelableDelayPromise(1);

    expect(cancelablePromise).toBeDefined();

    const hasCanceled = TimeoutRequester.hasCanceledError(new Error('test'));

    expect(typeof hasCanceled).toBe('boolean');

    // Clean up
    cancelablePromise.cancel();
    await cancelablePromise.catch(() => {
      // Expected to be canceled
    });
  });
});
