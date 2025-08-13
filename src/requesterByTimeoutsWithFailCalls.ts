import resolveRequesterByTimeoutWhenPossible from './resolveRequesterByTimeoutWhenPossible';

const requesterByTimeoutsWithFailCalls = <T, R = void>(
  maxFailRequestsCount: number,
  parameters: Omit<
    Parameters<typeof resolveRequesterByTimeoutWhenPossible<T, R>>[0],
    'isDontStopOnFail'
  > & {
    onFail?: () => void;
  },
) => {
  const { onFail, onSuccess, onBeforeStart } = parameters;

  let failedRequestCount = 0;

  const hasUpperLimit = (): boolean => {
    return failedRequestCount >= maxFailRequestsCount;
  };

  const processFail = (callback: () => void, reRun: () => void) => {
    failedRequestCount += 1;

    if (hasUpperLimit()) {
      failedRequestCount = 0;

      callback();
    } else {
      reRun();
    }
  };

  const requesterByTimeouts = resolveRequesterByTimeoutWhenPossible({
    ...parameters,
    onFail: (_error, reRun) => {
      if (onFail) {
        processFail(onFail, reRun);
      }
    },
    onSuccess: (data) => {
      failedRequestCount = 0;

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onBeforeStart: () => {
      failedRequestCount = 0;

      if (onBeforeStart) {
        onBeforeStart();
      }
    },
  });

  const startOriginal = requesterByTimeouts.start.bind(requesterByTimeouts);

  const start = async (
    data: Parameters<typeof startOriginal>[0],
    options: Parameters<typeof startOriginal>[1] = {},
  ) => {
    const onFailRequestModule = (error: Error, reRun: () => void) => {
      const { onFailRequest } = options;

      if (onFailRequest && onFail) {
        throw new Error('only one onFail is allowed');
      }

      if (onFailRequest) {
        processFail(() => {
          onFailRequest(error, reRun);
        }, reRun);
      }
    };

    return startOriginal(data, { ...options, onFailRequest: onFailRequestModule });
  };

  requesterByTimeouts.start = start;

  return requesterByTimeouts;
};

export default requesterByTimeoutsWithFailCalls;
