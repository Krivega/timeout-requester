/// <reference types="jest" />

import noop from '../noop';

describe('noop', () => {
  it('является функцией', () => {
    expect(typeof noop).toBe('function');
  });

  it('возвращает undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop()).toBeUndefined();
  });

  it('не выбрасывает исключений при вызове', () => {
    expect(() => {
      noop();
    }).not.toThrow();
  });

  it('может использоваться как колбэк', () => {
    expect(() => {
      [1, 2, 3].forEach(() => {
        noop();
      });
    }).not.toThrow();
  });
});
