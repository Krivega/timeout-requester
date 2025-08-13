/* eslint-disable @typescript-eslint/no-misused-promises */
import { CancelableRequest, isCanceledError } from '@krivega/cancelable-promise';

import SetTimeoutRequest from './SetTimeoutRequest';

declare type TThenArgumentRecursive<T> =
  T extends PromiseLike<infer U> ? TThenArgumentRecursive<U> : T;

type TOnSuccess<T> = (data: TThenArgumentRecursive<T>) => void;
type TOnFail = (error: Error, reRun: () => void) => void;

const notStartedError = new Error('not started');
const isNotStartedError = (error: Error) => {
  return error === notStartedError;
};

const resolveRequesterByTimeoutWhenPossible = <T, R = void>({
  request: requestFromParameters,
  requestInterval,
  hasIncreaseInterval,
  isDontStopOnFail,
  whenPossibleRequest,
  onSuccess: onSuccessFromParameters,
  onFail: onFailFromParameters,
  onBeforeStart: onBeforeStartFromParameters,
  onStop: onStopFromParameters,
}: {
  requestInterval: number;
  isDontStopOnFail?: boolean;
  hasIncreaseInterval?: () => boolean;
  whenPossibleRequest: () => Promise<void>;
  request: (argument: R) => Promise<TThenArgumentRecursive<T>>;
  onSuccess?: TOnSuccess<T>;
  onFail?: TOnFail;
  onBeforeStart?: () => void;
  onStop?: () => void;
}) => {
  let isStarted = false;
  const whenPossibleRequestCancelable = new CancelableRequest(async () => {
    if (!isStarted) {
      throw notStartedError;
    }

    return whenPossibleRequest();
  });
  const requester = new CancelableRequest<R, Promise<T>>(requestFromParameters);
  const setTimeoutRequest: SetTimeoutRequest = new SetTimeoutRequest();

  const cancelRequestRequestByTimeout = (): void => {
    whenPossibleRequestCancelable.cancelRequest();
    requester.cancelRequest();
    setTimeoutRequest.cancelRequest();
  };
  const getRequestInterval = (): number => {
    return hasIncreaseInterval?.() === true ? requestInterval * 3 : requestInterval;
  };

  const requestWhenPossible = async (
    argument: R,
    { onFail, onSuccess }: { onSuccess: TOnSuccess<T>; onFail: (error: Error) => void },
  ) => {
    return whenPossibleRequestCancelable
      .request()
      .then(async () => {
        return requester.request(argument);
      })
      .then(onSuccess)
      .catch((error: unknown) => {
        if (!isCanceledError(error) && !isNotStartedError(error as Error)) {
          onFail(error as Error);
        }
      });
  };

  const start = async (
    argument: R,
    {
      onFailRequest,
      onSuccessRequest,
    }: { onFailRequest?: TOnFail; onSuccessRequest?: TOnSuccess<T> } = {},
  ) => {
    isStarted = true;

    if (onBeforeStartFromParameters) {
      onBeforeStartFromParameters();
    }

    const runSuccessCallbacks = (data: TThenArgumentRecursive<T>) => {
      if (onSuccessRequest) {
        onSuccessRequest(data);
      }

      if (onSuccessFromParameters) {
        onSuccessFromParameters(data);
      }
    };

    const runFailCallbacks = (error: Error, reRun: () => void) => {
      if (onFailRequest) {
        onFailRequest(error, reRun);
      }

      if (onFailFromParameters) {
        onFailFromParameters(error, reRun);
      }
    };

    const requestByTimeout = async () => {
      cancelRequestRequestByTimeout();

      return requestWhenPossible(argument, {
        onSuccess(data: TThenArgumentRecursive<T>) {
          runSuccessCallbacks(data);

          setTimeoutRequest.request(requestByTimeout, getRequestInterval());
        },
        onFail(error: Error) {
          const request = () => {
            setTimeoutRequest.request(requestByTimeout, getRequestInterval());
          };

          runFailCallbacks(error, request);

          if (isDontStopOnFail === true) {
            request();
          }
        },
      });
    };

    return requestByTimeout();
  };

  const stop = () => {
    isStarted = false;

    if (onStopFromParameters) {
      onStopFromParameters();
    }

    cancelRequestRequestByTimeout();
  };

  return { start, stop, cancelRequestRequestByTimeout };
};

export default resolveRequesterByTimeoutWhenPossible;
