/// <reference types="jest" />
import hasCanceledError, { canceledError } from '../hasCanceledError';

describe('hasCanceledError', () => {
  it('должен возвращать true для отмененной ошибки', () => {
    expect(hasCanceledError(canceledError)).toBe(true);
  });

  it('должен возвращать false для обычной ошибки', () => {
    const someOtherError = new Error('some other error');

    expect(hasCanceledError(someOtherError)).toBe(false);
  });
});
