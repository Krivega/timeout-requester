/// <reference types="jest" />
import { errorFailedRequest, errorNotPossibleRequest } from '../__fixtures__/mockErrors';
import mockRequestData, { emptyMockData } from '../__fixtures__/mockRequestData';
import {
  hasIncreaseInterval,
  onFail,
  onStop,
  onSuccess,
  onSuccessRequest,
  requestFail,
  requestInterval,
  requestSuccess,
  whenNotPossibleRequest,
  whenPossibleRequest,
} from '../__fixtures__/mockTimeoutRequesterParametrs';
import delay from '../__tests-utils__/delay';
import { resolveRequesterByTimeoutWhenPossible } from '../index';

let timeoutRequester: ReturnType<typeof resolveRequesterByTimeoutWhenPossible>;

describe('resolveRequesterByTimeoutWhenPossible', () => {
  afterEach(() => {
    timeoutRequester.stop();
    jest.resetAllMocks();
  });

  it('запускает запросы когда возможно', async () => {
    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onFail,
      onSuccess,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('не запускает запросы когда невозможно', async () => {
    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestSuccess,
      whenPossibleRequest: whenNotPossibleRequest,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onSuccess).toHaveBeenCalledTimes(0);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith(errorNotPossibleRequest, expect.any(Function));
  });

  it('передает onFail в start', async () => {
    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestSuccess,
      whenPossibleRequest: whenNotPossibleRequest,
    });

    const onFail2 = jest.fn();

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onSuccess).toHaveBeenCalledTimes(0);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail2).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith(errorNotPossibleRequest, expect.any(Function));
    expect(onFail2).toHaveBeenCalledWith(errorNotPossibleRequest, expect.any(Function));
  });

  it('вызывает onSuccess callback при успешном запросе', async () => {
    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      request: requestSuccess,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(mockRequestData);
  });

  it('вызывает onSuccessRequest callback при успешном запросе', async () => {
    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      request: requestSuccess,
    });

    await timeoutRequester.start(emptyMockData, { onSuccessRequest });

    expect(onSuccessRequest).toHaveBeenCalledTimes(1);
    expect(onSuccessRequest).toHaveBeenCalledWith(mockRequestData);
  });

  it('вызывает onFail callback при неудачном запросе', async () => {
    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onSuccess).toHaveBeenCalledTimes(0);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith(errorFailedRequest, expect.any(Function));
  });

  it('работает без onFail', async () => {
    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('должен останавливать запросы при неудачном запросе', async () => {
    const requestFailMock = jest.fn();

    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      request: async () => {
        requestFailMock();

        return requestFail();
      },
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      onFail,
    });

    const requestPromise = timeoutRequester.start(emptyMockData);

    await requestPromise;

    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is started

    await delay(requestInterval * 2);

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is not retried after stopping
  });

  it('должен останавливать запросы при вызове stop', async () => {
    const requestFailMock = jest.fn();

    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      request: async () => {
        requestFailMock();

        return requestFail();
      },
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      onStop,
    });

    const requestPromise = timeoutRequester.start(emptyMockData);

    await requestPromise;

    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is started

    timeoutRequester.stop();

    await delay(requestInterval * 2);

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is not retried after stopping
  });

  it('не должен останавливать запросы когда isDontStopOnFail равно true', async () => {
    const requestFailMock = jest.fn();

    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      request: async () => {
        requestFailMock();

        return requestFail();
      },
      isDontStopOnFail: true,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      onStop,
      onFail,
    });

    const requestPromise = timeoutRequester.start(emptyMockData);

    await requestPromise;

    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is started
    expect(onFail).toHaveBeenCalledTimes(1);

    await delay(requestInterval);

    expect(onStop).toHaveBeenCalledTimes(0);
    expect(onFail).toHaveBeenCalledTimes(2);
    expect(requestFailMock).toHaveBeenCalledTimes(2); // Request is not retried after stopping
  });

  it('должен останавливать запросы когда isDontStopOnFail равно true и вызван stop', async () => {
    const requestFailMock = jest.fn();

    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      request: async () => {
        requestFailMock();

        return requestFail();
      },
      isDontStopOnFail: true,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      onStop,
      onFail,
    });

    const requestPromise = timeoutRequester.start(emptyMockData);

    timeoutRequester.stop();
    await requestPromise;

    expect(onFail).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('использует интервал requestInterval * 3 при hasIncreaseInterval === true', async () => {
    hasIncreaseInterval.mockReturnValue(true);

    const request = jest.fn(requestSuccess);

    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      request,
    });

    const requestPromise = timeoutRequester.start(emptyMockData);

    await requestPromise;

    expect(request).toHaveBeenCalledTimes(1);

    await delay(requestInterval * 2);
    expect(request).toHaveBeenCalledTimes(1);

    await delay(requestInterval + 50);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('не вызывает onFail при notStartedError после stop (ветка throw notStartedError покрыта)', async () => {
    const request = jest.fn(requestSuccess);

    timeoutRequester = resolveRequesterByTimeoutWhenPossible({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      whenPossibleRequest,
      request,
    });

    await new Promise<void>((resolve, reject) => {
      timeoutRequester
        .start(emptyMockData, {
          onSuccessRequest: () => {
            // Останавливаем сразу после успешного запроса,
            // чтобы следующий запуск пришёлся на isStarted === false
            timeoutRequester.stop();
            resolve();
          },
        })
        .catch(reject);
    });

    // Ждём больше одного интервала,
    // чтобы сработал запланированный таймер и внутренняя функция бросила notStartedError
    await delay(requestInterval + 50);

    expect(onFail).toHaveBeenCalledTimes(0);
    expect(request).toHaveBeenCalledTimes(1);
  });
});
