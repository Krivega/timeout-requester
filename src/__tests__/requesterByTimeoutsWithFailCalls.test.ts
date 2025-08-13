/// <reference types="jest" />
import { emptyMockData } from '../__fixtures__/mockRequestData';
import {
  hasIncreaseInterval,
  onBeforeStart,
  onFail,
  onSuccess,
  requestFail,
  requestSuccess,
  whenPossibleRequest,
} from '../__fixtures__/mockTimeoutRequesterParametrs';
import delay from '../__tests-utils__/delay';
import { requesterByTimeoutsWithFailCalls } from '../index';

const requestInterval = 50;

let timeoutRequester: ReturnType<typeof requesterByTimeoutsWithFailCalls>;

describe('requesterByTimeoutsWithFailCalls', () => {
  afterEach(() => {
    timeoutRequester.stop();
    jest.resetAllMocks();
  });

  it('#1 должен завершиться неудачей после первого неудачного запроса когда maxFailRequestsCount равно 1', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(1, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('#2 не должен завершиться неудачей после первого неудачного запроса когда maxFailRequestsCount равно 2', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('#3 должен завершиться неудачей после второго неудачного запроса когда maxFailRequestsCount равно 2', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('#4 должен остановить запросы после onFail', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(1, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(1);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('#5 должен завершиться неудачей после первого неудачного запроса когда maxFailRequestsCount отрицательное число', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(-3, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('#6 не должен завершиться неудачей после успешного запроса когда maxFailRequestsCount равно 1', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(1, {
      onFail,
      onSuccess,
      requestInterval,
      onBeforeStart,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('#7 должен сбросить failedRequestCount при остановке и последующем запуске запроса', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(0);

    timeoutRequester.stop();

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('#8 должен сбросить failedRequestCount при повторном запуске после onFail', async () => {
    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(1);

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(1);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(2);
  });

  it('#9 не должен вызывать onFail когда первый запрос неудачный а второй успешный', async () => {
    let request = 0;

    const evenRequestFail = async () => {
      request += 1;

      if (request % 2 === 1) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw undefined;
      }
    };

    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onFail,
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: evenRequestFail,
    });

    await timeoutRequester.start(emptyMockData);

    expect(onFail).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail).toHaveBeenCalledTimes(0);
  });

  it('#10 должен завершиться неудачей после первого неудачного запроса когда maxFailRequestsCount равно 1', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(1, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(1);
  });

  it('#11 не должен завершиться неудачей после первого неудачного запроса когда maxFailRequestsCount равно 2', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(0);
  });

  it('#12 должен завершиться неудачей после второго неудачного запроса когда maxFailRequestsCount равно 2', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(1);
  });

  it('#13 должен остановить запросы после onFail', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(1, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(1);

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(1);
  });

  it('#14 должен завершиться неудачей после первого неудачного запроса когда maxFailRequestsCount отрицательное число', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(-3, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(1);
  });

  it('#15 не должен завершиться неудачей после успешного запроса когда maxFailRequestsCount равно 1', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(1, {
      onSuccess,
      requestInterval,
      onBeforeStart,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestSuccess,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(0);
  });

  it('#16 должен сбросить failedRequestCount при остановке и последующем запуске запроса', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(0);

    timeoutRequester.stop();

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(1);
  });

  it('#17 должен сбросить failedRequestCount при повторном запуске после onFail', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(1);

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(1);

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(2);
  });

  it('#18 не должен вызывать onFail когда первый запрос неудачный а второй успешный', async () => {
    const onFail2 = jest.fn();
    let request = 0;

    const evenRequestFail = async () => {
      request += 1;

      if (request % 2 === 1) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw undefined;
      }
    };

    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onSuccess,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: evenRequestFail,
    });

    await timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    expect(onFail2).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(0);

    await delay(requestInterval);

    expect(onFail2).toHaveBeenCalledTimes(0);
  });

  it('#19 разрешен только один onFail', async () => {
    const onFail2 = jest.fn();

    timeoutRequester = requesterByTimeoutsWithFailCalls(2, {
      onSuccess,
      onFail,
      onBeforeStart,
      requestInterval,
      whenPossibleRequest,
      hasIncreaseInterval,
      request: requestFail,
    });

    const promise = timeoutRequester.start(emptyMockData, { onFailRequest: onFail2 });

    return expect(promise).rejects.toEqual(new Error('only one onFail is allowed'));
  });
});
