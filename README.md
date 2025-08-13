# Timeout requester

Timeout requester содержит модули, позволяющие выполнять интервальные запросы

- [`resolveRequesterByTimeout`](#resolveRequesterByTimeout)
- [`requesterByTimeoutsWithFailCalls`](#requesterByTimeoutsWithFailCalls)
- [`cancelableDelayPromise`](#cancelableDelayPromise)
- [`DelayRequester`](#DelayRequester)
- [`SetTimeoutRequest`](#SetTimeoutRequest)

## Установка

1. Add to dependencies package.json "@krivega/timeout-requester: version"

## Использование

#### <a name="resolveRequesterByTimeout"></a> `resolveRequesterByTimeout([options])`

  Позволяет совершать интервальные запросы по указанному таймауту

```ts
  import { resolveRequesterByTimeout } from '@krivega/timeout-requester';

  const request = (data: TRequestData): Promise<TResponseData> => {
    return fetch(data);
  };

  const onSuccess = (response: TResponseData) => {
    setResponse(response);
  };

  const onFail = (error) => {
    // some code
  };

  const whenPossibleRequest = async() => {}

  const requestByTimeout = resolveRequesterByTimeout<
    TResponseData,
    TRequestData
  >({
    requestInterval: 10_000,
    whenPossibleRequest,
    onSuccess,
    request,
    onFail,
  });

  // Запуск запросов

  // onFailRequest - Вызов функции произойдет после падения запроса `request` в ошибку
  // onSuccessRequest - Вызов функции произойдет после успешного запроса `request`
  requestByTimeout.start(data, { onFailRequest, onSuccessRequest });

  // Остановка запросов
  requestByTimeout.stop();

  // Отмена запросов. Отличие от stop() в том, что не вызывается onStop
  requestByTimeout.cancelRequestRequestByTimeout();
```

### Options

| Название              |        Тип    |значение по умолчанию |      Описание                                          |
|-----------------------|---------------|----------------------|--------------------------------------------------------|
| request               | `(args) => Promise` | `undefined`          | Запрос который будет выполняться по таймауту     |
| requestInterval       | `Number` | `undefined`        | интервал запроса                                              |
| isDontStopOnFail?     | `Boolean` | `undefined`| при установке флага в `true`, запросы будут продолжать отправляться после падения |
| hasIncreaseInterval?  | `() => Boolean` | `undefined`| если функция вернет `true`, интервал запроса увеличится в 3 раза|
| whenPossibleRequest?  | `() => Promise<void>` | `async () => {}` | асинхронная функция, по результату выполнения которой, произойдет вызов `request (resolved)`, либо `onFail (rejected)`|
| onBeforeStart?        | `() => void` | `undefined` | Вызов функции произойдет один раз перед началом отправки запросов|
| onSuccess?            | `(data) => void`| `undefined` | Вызов функции произойдет после успешного запроса `request`    |
| onFail?               | `(error: Error, reRun: () => void) => void` | `undefined`| Вызов функции произойдет после падения запроса `request` в ошибку |
| onStop?               | `() => void` | `undefined`    | Вызов функции произойдет после вызова stop                    |

#### <a name="requesterByTimeoutsWithFailCalls"></a> `requesterByTimeoutsWithFailCalls(failAmount, [options])`

  Модуль является частным случаем [`resolveRequesterByTimeout`](#resolveRequesterByTimeout), за тем исключением, что `onFail` не вызовется, пока количество упавших запросов не превысит значение, передаваемое первым параметром.

```ts
  import { requesterByTimeoutsWithFailCalls } from '@krivega/timeout-requester';

  const requestConferenceByTimeout = requesterByTimeoutsWithFailCalls(10, {
    requestInterval: requestIntervalMS,
    whenPossibleRequest,
    onSuccess,
    request,
    onFail,
  });

```

### Options

| Название              |        Тип    |значение по умолчанию |      Описание                                          |
|-----------------------|---------------|----------------------|--------------------------------------------------------|
| request               | `(args) => Promise` | `undefined`          | Запрос который будет выполняться по таймауту     |
| requestInterval       | `Number` | `undefined`        | интервал запроса                                              |
| hasIncreaseInterval?  | `() => Boolean` | `undefined`| если функция вернет `true`, интервал запроса увеличится в 3 раза|
| whenPossibleRequest?  | `() => Promise<void>` | `async () => {}` | асинхронная функция, по результату выполнения которой, произойдет вызов `request (resolved)`, либо `onFail (rejected)`|
| onBeforeStart?        | `() => void` | `undefined` | Вызов функции произойдет один раз перед началом отправки запросов|
| onSuccess?            | `(data) => void`| `undefined` | Вызов функции произойдет после успешного запроса `request`    |
| onFail?               | `() => void` | `undefined`    | Вызов функции произойдет после падения запроса `request` в ошибку |
| onStop?               | `() => void` | `undefined`    | Вызов функции произойдет после вызова stop                    |

#### <a name="cancelableDelayPromise"></a> `cancelableDelayPromise(delayMS)`

Позволяет совершить вызов какой-либо функции с задержкой, и возможностью его отменить до момента завершения таймера. Возвращает промис

```ts
  import { cancelableDelayPromise } from '@krivega/timeout-requester';

  const promise = cancelableDelayPromise(1000);

  // promise выполнится с ошибкой `Canceled`
  promise.cancel();
```

`Canceled` ошибку можно проверить вызовом функции `isCanceledError` из пакета [@krivega/cancelable-promise](https://github.com/Krivega/cancelable-promise)

#### <a name="DelayRequester"></a> `new DelayRequester(delayMS)`

Предоставляет класс для создания асинхронной функции, которая выполнится с задержкой, и возможностью его отменить до момента истечения таймера.

При повторном вызове `delayRequester.request()`, если предыдущий промис еще не выполнился, завершит предыдущий с `Canceled` ошибкой.

```ts
  import { DelayRequester } from '@krivega/timeout-requester';

  const delayMS = 1000

  const delayRequester = new DelayRequester(100);

  const promise = delayRequester.request()

  // promise выполнится с ошибкой `Canceled`
  delayRequester.cancelRequest();
```

```ts
interface DelayRequester {
  request: (timeoutForce?: number): Promise<void>;
  cancelRequest: () => void;
}
```

`Canceled` ошибку можно проверить вызовом функции `isCanceledError` из пакета [@krivega/cancelable-promise](https://github.com/Krivega/cancelable-promise)

#### <a name="SetTimeoutRequest"></a>  `new SetTimeoutRequest()`

Предоставляет класс, позволяющий выполнить какую либо функцию по таймауту и возможностью данный таймаут отменить. В `SetTimeoutRequest` не используются промисы

```ts
  import { SetTimeoutRequest } from '@krivega/timeout-requester';

  const setTimeoutRequest = new SetTimeoutRequest();

  const delayMS = 1000

  setTimeoutRequest.request(someFunction, delayMS);

  setTimeoutRequest.cancelRequest();
```

```ts
interface setTimeoutRequest {
  request: (timeoutFunction: () => void, delay: number) => void;
  cancelRequest: () => void;
  requested: boolean;
  requestID: NodeJS.Timeout | undefined;
}
```
