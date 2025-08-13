/// <reference types="jest" />
import { isCanceledError } from '@krivega/cancelable-promise';

import cancelableDelayPromise from '../cancelableDelayPromise';

describe('cancelableDelayPromise', () => {
  it('успешно выполняется', async () => {
    expect.assertions(1);

    await cancelableDelayPromise(100)
      .then(() => {
        return true;
      })
      .then((data) => {
        expect(data).toBe(true);
      });
  });

  it('отменяется', async () => {
    expect.assertions(1);

    const promise = cancelableDelayPromise(100);

    promise.cancel();

    let canceledError = new Error('not canceled error');

    await promise.catch((error: unknown) => {
      canceledError = error as Error;
    });

    expect(isCanceledError(canceledError)).toBe(true);
  });
});
