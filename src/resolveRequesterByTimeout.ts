import { CancelableRequest, isCanceledError } from '@krivega/cancelable-promise';

import SetTimeoutRequest from './SetTimeoutRequest';

declare type TThenArgumentRecursive<T> =
  T extends PromiseLike<infer U> ? TThenArgumentRecursive<U> : T;

type TOnSuccess<T> = (data: TThenArgumentRecursive<T>) => void;
type TOnFail = (error: Error, reRun: () => void) => void;

const resolveRequesterByTimeout = <T, R = void>({
  request: requestFromParameters,
  requestInterval,
  hasIncreaseInterval,
  isDontStopOnFail,
  onSuccess: onSuccessFromParameters,
  onFail: onFailFromParameters,
  onBeforeStart: onBeforeStartFromParameters,
  onStop: onStopFromParameters,
}: {
  requestInterval: number;
  isDontStopOnFail?: boolean;
  hasIncreaseInterval?: () => boolean;
  request: (argument: R) => Promise<TThenArgumentRecursive<T>>;
  onSuccess?: TOnSuccess<T>;
  onFail?: TOnFail;
  onBeforeStart?: () => void;
  onStop?: () => void;
}) => {
  let isStarted = false;

  const requester = new CancelableRequest<R, Promise<T>>(requestFromParameters);
  const setTimeoutRequest: SetTimeoutRequest = new SetTimeoutRequest();

  const cancelRequestRequestByTimeout = (): void => {
    requester.cancelRequest();
    setTimeoutRequest.cancelRequest();
  };
  const getRequestInterval = (): number => {
    return hasIncreaseInterval?.() === true ? requestInterval * 3 : requestInterval;
  };

  const requestWhenPossible = (
    argument: R,
    { onFail, onSuccess }: { onSuccess: TOnSuccess<T>; onFail: (error: Error) => void },
  ) => {
    if (isStarted) {
      requester
        .request(argument)
        .then(onSuccess)
        .catch((error: unknown) => {
          if (!isCanceledError(error)) {
            onFail(error as Error);
          }
        });
    }
  };

  const start = (
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

    const requestByTimeout = () => {
      cancelRequestRequestByTimeout();

      requestWhenPossible(argument, {
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

    requestByTimeout();
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

export default resolveRequesterByTimeout;
