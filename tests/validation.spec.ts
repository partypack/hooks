import { renderHook, act } from '@testing-library/react-hooks';
import useValidation, { Validator } from '../lib/use-validation';

function validator(value: string): Validator[] {
  return [(v: string) => (v !== value ? 'invalid' : undefined)];
}

function asyncValidator(value: string): Validator[] {
  return [
    (v: string) =>
      new Promise((resolve) =>
        setTimeout(() => resolve(v !== value ? 'invalid' : undefined), 100)
      ),
  ];
}

function asyncEagerValidator(value: string): Validator[] {
  return [
    (v: string, _, sync) =>
      new Promise((resolve) =>
        setTimeout(
          () => resolve(v !== value ? sync('invalid') : undefined),
          100
        )
      ),
  ];
}

function multipleValidation(value: string): Validator[] {
  return [
    (v: string, _, sync) =>
      new Promise((resolve) =>
        setTimeout(() => resolve(v !== value ? sync('async') : undefined), 100)
      ),
    (v: string) => (v !== value ? 'sync' : undefined),
  ];
}

describe('useValidation', () => {
  test('should initialize', () => {
    const { result } = renderHook(() =>
      useValidation({ value: 'initial' }, { value: validator('initial') })
    );

    expect(result.current.invalid).toBe(false);
    expect(result.current.waiting.value).toBe(false);
    expect(result.current.errors.value).toBeUndefined();
  });

  test('invalid initialization should be invalid', () => {
    const { result } = renderHook(() =>
      useValidation({ value: 'invalid' }, { value: validator('initial') })
    );

    expect(result.current.invalid).toBe(true);
  });

  test('invalid should track validation state', () => {
    let value = 'initial';

    const { result, rerender } = renderHook(() =>
      useValidation({ value }, { value: validator('initial') })
    );

    value = 'update';
    rerender();
    expect(result.current.invalid).toBe(true);
  });

  test('errors should track validation lazily', () => {
    let value = 'initial';

    const { result, rerender } = renderHook(() =>
      useValidation({ value }, { value: validator('initial') })
    );

    value = 'update';
    rerender();
    expect(result.current.errors.value).toBeUndefined();
    act(() => result.current.validate.value());
    expect(result.current.errors.value).toBe('invalid');
  });

  test('validate should have dispatch signature', () => {
    let value = 'initial';

    const { result, rerender } = renderHook(() =>
      useValidation({ value }, { value: validator('initial') })
    );

    value = 'update';
    rerender();
    expect(result.current.errors.value).toBeUndefined();
    act(() => result.current.validate());
    expect(result.current.errors.value).toBe('invalid');
  });

  test('errors should omit keys when valid', () => {
    let value = 'initial';

    const { result, rerender } = renderHook(() =>
      useValidation({ value }, { value: validator('initial') })
    );

    value = 'update';
    rerender();
    act(() => result.current.validate.value());
    value = 'initial';
    rerender();
    act(() => result.current.validate.value());
    expect(Object.keys(result.current.errors)).not.toContain('value');
  });

  test('repeated validations should not mutate reference when value is unchanged', () => {
    let value = 'initial';

    const { result, rerender } = renderHook(() =>
      useValidation({ value }, { value: validator('initial') })
    );

    value = 'update';
    rerender();
    act(() => result.current.validate.value());
    const { errors } = result.current;
    act(() => result.current.validate.value());
    expect(result.current.errors).toBe(errors);
  });

  test('repeated validations should not mutate reference when error is unchanged', () => {
    let value = 'initial';

    const { result, rerender } = renderHook(() =>
      useValidation({ value }, { value: validator('initial') })
    );

    value = 'one';
    rerender();
    act(() => result.current.validate.value());
    const { errors } = result.current;
    value = 'two';
    rerender();
    act(() => result.current.validate.value());
    expect(result.current.errors).toBe(errors);
  });

  test('repeated validations should mutate reference when error is changed', () => {
    let value = 'initial';

    const { result, rerender } = renderHook(() =>
      useValidation({ value }, { value: validator('initial') })
    );

    value = 'update';
    rerender();
    act(() => result.current.validate.value());
    const { errors } = result.current;
    value = 'initial';
    rerender();
    act(() => result.current.validate.value());
    expect(result.current.errors).not.toBe(errors);
  });

  test('async validation should register waiting values', async () => {
    let value = 'initial';

    const { result, rerender, waitForNextUpdate } = renderHook(() =>
      useValidation({ value }, { value: asyncValidator('initial') })
    );

    expect(result.current.waiting.value).toBe(true);
    await waitForNextUpdate();
    expect(result.current.waiting.value).toBe(false);
    value = 'update';
    rerender();
    expect(result.current.waiting.value).toBe(true);
  });

  test('async validation should be invalid until resolved', async () => {
    let value = 'initial';

    const { result, waitForNextUpdate } = renderHook(() =>
      useValidation({ value }, { value: asyncValidator('initial') })
    );

    expect(result.current.invalid).toBe(true);
    await waitForNextUpdate();
    expect(result.current.invalid).toBe(false);
  });

  test('async validation should lazily produce error when invalid', async () => {
    let value = 'initial';

    const { result, rerender, waitForNextUpdate } = renderHook(() =>
      useValidation({ value }, { value: asyncValidator('initial') })
    );

    await waitForNextUpdate();
    value = 'update';
    rerender();
    expect(result.current.errors.value).toBeUndefined();
    await waitForNextUpdate();
    expect(result.current.errors.value).toBeUndefined();
    act(() => result.current.validate.value());
    expect(result.current.errors.value).toBe('invalid');
  });

  test('async validation should support synced error when invalid', async () => {
    let value = 'initial';

    const { result, rerender, waitForNextUpdate } = renderHook(() =>
      useValidation({ value }, { value: asyncEagerValidator('initial') })
    );

    await waitForNextUpdate();
    value = 'update';
    rerender();
    await waitForNextUpdate();
    expect(result.current.errors.value).toBe('invalid');
  });

  test('ordinary validation should take precedent over async validation', async () => {
    let value = 'invalid';

    const { result, waitForNextUpdate } = renderHook(() =>
      useValidation({ value }, { value: multipleValidation('initial') })
    );

    await waitForNextUpdate();
    act(() => result.current.validate.value());
    expect(result.current.errors.value).toBe('sync');
  });

  // TODO: evaluate correctness.
  test('repeated async validation should cancel pending validations', async () => {
    let value = 'initial';

    const { result, rerender, waitForNextUpdate } = renderHook(() =>
      useValidation({ value }, { value: asyncEagerValidator('initial') })
    );

    await waitForNextUpdate();
    value = 'update';
    rerender();
    value = 'initial';
    rerender();
    await waitForNextUpdate();
    expect(result.current.errors.value).toBeUndefined();
  });
});
