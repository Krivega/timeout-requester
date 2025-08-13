/// <reference types="jest" />
import { DelayRequester } from '..';
import hasCanceledError from '../hasCanceledError';

describe('DelayRequester', () => {
  it('успешно выполняется', async () => {
    expect.assertions(1);

    const delayRequester = new DelayRequester(100);

    await delayRequester
      .request()
      .then(() => {
        return true;
      })
      .then((data) => {
        expect(data).toBe(true);
      });
  });

  it('отменяется', async () => {
    expect.assertions(1);

    const delayRequester = new DelayRequester(100);
    const promise = delayRequester.request();

    delayRequester.cancelRequest();

    let canceledError = new Error('not canceled error');

    await promise.catch((error: unknown) => {
      canceledError = error as Error;
    });

    expect(hasCanceledError(canceledError)).toBe(true);
  });
});
