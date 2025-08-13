const doMock = () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const moduleTimeoutRequester = jest.requireActual<typeof import('@krivega/timeout-requester')>(
    '@krivega/timeout-requester',
  );

  const originalResolveRequesterByTimeout = moduleTimeoutRequester.resolveRequesterByTimeout;

  const mockRequesterByTimeout = async () => {
    return new Promise<() => void>((resolve, reject) => {
      moduleTimeoutRequester.resolveRequesterByTimeout = (...parameters) => {
        const requesterByTimeout = originalResolveRequesterByTimeout(...parameters);
        const { start } = requesterByTimeout;

        requesterByTimeout.start = function myMock(...parametersStart) {
          start(...parametersStart);

          resolve(() => {
            start(...parametersStart);
          });
        };

        setTimeout(reject, 1000);

        return requesterByTimeout;
      };
    });
  };

  const restoreOriginal = () => {
    moduleTimeoutRequester.resolveRequesterByTimeout = originalResolveRequesterByTimeout;
  };

  return { mockRequesterByTimeout, restoreOriginal };
};

export default doMock;
