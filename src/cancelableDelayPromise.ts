import { createErrorCanceled } from '@krivega/cancelable-promise';

import noop from './noop';

import type { ICancelablePromise } from '@krivega/cancelable-promise';

const cancelableDelayPromise = (timeout: number): ICancelablePromise<void> => {
  let resolveDeferred: () => void = noop;
  let rejectDeferred: (error: Error) => void = noop;

  const promise = new Promise<void>((resolve, reject) => {
    resolveDeferred = resolve;
    rejectDeferred = reject;
  });

  const timeoutId = setTimeout(resolveDeferred, timeout);

  const cancelablePromise: ICancelablePromise<void> = promise as ICancelablePromise<void>;

  cancelablePromise.cancel = () => {
    clearTimeout(timeoutId);
    rejectDeferred(createErrorCanceled(promise));
  };

  return cancelablePromise;
};

export default cancelableDelayPromise;
