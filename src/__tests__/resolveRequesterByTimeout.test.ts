/// <reference types="jest" />

import { errorFailedRequest } from '../__fixtures__/mockErrors';
import mockRequestData, { emptyMockData } from '../__fixtures__/mockRequestData';
import {
  hasIncreaseInterval,
  onBeforeStart,
  onFail,
  onStop,
  onSuccess,
  onSuccessRequest,
  requestFail,
  requestInterval,
  requestSuccess,
} from '../__fixtures__/mockTimeoutRequesterParametrs';
import delay from '../__tests-utils__/delay';
import resolveRequesterByTimeout from '../resolveRequesterByTimeout';

let timeoutRequester: ReturnType<typeof resolveRequesterByTimeout>;

describe('resolveRequesterByTimeout', () => {
  afterEach(() => {
    timeoutRequester.stop();
    jest.resetAllMocks();
  });

  it('запускает запросы когда возможно', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('вызывает onSuccess callback при успешном запросе', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(mockRequestData);
  });

  it('вызывает onSuccessRequest callback при успешном запросе', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    timeoutRequester.start(emptyMockData, { onSuccessRequest });

    await delay(requestInterval);

    expect(onSuccessRequest).toHaveBeenCalledTimes(1);
    expect(onSuccessRequest).toHaveBeenCalledWith(mockRequestData);
  });

  it('вызывает только onSuccessRequest без onSuccess в конструкторе', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      requestInterval,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    timeoutRequester.start(emptyMockData, { onSuccessRequest });

    await delay(requestInterval);

    expect(onSuccessRequest).toHaveBeenCalledTimes(1);
    expect(onSuccessRequest).toHaveBeenCalledWith(mockRequestData);
  });

  it('вызывает onFail callback при неудачном запросе', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestFail,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(onSuccess).toHaveBeenCalledTimes(0);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith(errorFailedRequest, expect.any(Function));
  });

  it('вызывает onFailRequest callback при неудачном запросе', async () => {
    const onFailRequest = jest.fn();

    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestFail,
    });

    timeoutRequester.start(emptyMockData, { onFailRequest });

    await delay(requestInterval);

    expect(onSuccess).toHaveBeenCalledTimes(0);
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFailRequest).toHaveBeenCalledTimes(1);
    expect(onFailRequest).toHaveBeenCalledWith(errorFailedRequest, expect.any(Function));
  });

  it('работает без whenPossibleRequest', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('работает без onFail', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request: requestFail,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('должен останавливать запросы при неудачном запросе', async () => {
    const requestFailMock = jest.fn();

    timeoutRequester = resolveRequesterByTimeout({
      request: async () => {
        requestFailMock();

        return requestFail();
      },
      requestInterval,
      hasIncreaseInterval,
      onFail,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is started

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is not retried after stopping
  });

  it('должен останавливать запросы при вызове stop', async () => {
    const requestFailMock = jest.fn();

    timeoutRequester = resolveRequesterByTimeout({
      request: async () => {
        requestFailMock();

        return requestFail();
      },
      requestInterval,
      hasIncreaseInterval,
      onStop,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is started

    timeoutRequester.stop();

    await delay(requestInterval);

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is not retried after stopping
  });

  it('не должен останавливать запросы когда isDontStopOnFail равно true', async () => {
    const requestFailMock = jest.fn();

    timeoutRequester = resolveRequesterByTimeout({
      request: async () => {
        requestFailMock();

        return requestFail();
      },
      isDontStopOnFail: true,
      requestInterval,
      hasIncreaseInterval,
      onStop,
      onFail,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(requestFailMock).toHaveBeenCalledTimes(1); // Request is started
    expect(onFail).toHaveBeenCalledTimes(1);

    await delay(requestInterval);

    expect(onStop).toHaveBeenCalledTimes(0);
    expect(onFail).toHaveBeenCalledTimes(2);
    expect(requestFailMock).toHaveBeenCalledTimes(2); // Request is not retried after stopping
  });

  it('должен останавливать запросы когда isDontStopOnFail равно true и вызван stop', async () => {
    timeoutRequester = resolveRequesterByTimeout({
      request: requestSuccess,
      isDontStopOnFail: true,
      requestInterval,
      hasIncreaseInterval,
      onStop,
      onFail,
    });

    timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    timeoutRequester.stop();

    expect(onFail).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('не должен отправлять запрос снова когда запросчик остановлен сразу после успешного предыдущего запроса', async () => {
    const request = jest.fn(requestSuccess);

    timeoutRequester = resolveRequesterByTimeout({
      onFail,
      onSuccess,
      onStop,
      requestInterval,
      hasIncreaseInterval,
      request,
    });

    await new Promise<void>((resolve) => {
      timeoutRequester.start(emptyMockData, {
        onSuccessRequest: () => {
          timeoutRequester.stop();
          resolve();
        },
      });
    });

    await delay(requestInterval);
    await delay(requestInterval);

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('использует интервал requestInterval * 3 при hasIncreaseInterval === true', async () => {
    hasIncreaseInterval.mockReturnValue(true);

    const request = jest.fn(requestSuccess);

    timeoutRequester = resolveRequesterByTimeout({
      onSuccess,
      requestInterval,
      hasIncreaseInterval,
      request,
    });

    timeoutRequester.start(emptyMockData);

    // Сразу после старта выполняется первый запрос
    await delay(requestInterval);
    expect(request).toHaveBeenCalledTimes(1);

    // Через 2 * requestInterval повторного запроса быть не должно
    await delay(requestInterval);
    expect(request).toHaveBeenCalledTimes(1);

    // К моменту 3 * requestInterval должен быть второй запуск
    await delay(requestInterval + 50);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('вызывает onBeforeStart при запуске', () => {
    timeoutRequester = resolveRequesterByTimeout({
      onBeforeStart,
      request: requestSuccess,
      requestInterval,
      hasIncreaseInterval,
    });

    timeoutRequester.start(emptyMockData);

    expect(onBeforeStart).toHaveBeenCalledTimes(1);
  });
});
