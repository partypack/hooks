import { renderHook, act } from '@testing-library/react-hooks';
import useForm from '../lib/use-form';

describe('useForm', () => {
  test('should initialize', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    expect(result.current.values.value).toBe('initial');
    expect(result.current.partial.value).toBeUndefined();
    expect(result.current.pristine).toBe(true);
  });

  test('dispatch should modify values', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    act(() => result.current.update.value('update'));
    expect(result.current.values.value).toBe('update');
  });

  test('dispatch should modify partial', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    act(() => result.current.update.value('update'));
    expect(result.current.partial.value).toBe('update');
  });

  test('dispatch should support SetStateAction', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    act(() => result.current.update.value((v: string) => v.toUpperCase()));
    expect(result.current.values.value).toBe('INITIAL');
  });

  test('dispatch should not mutate references when value is unchanged', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    const { values, partial } = result.current;
    act(() => result.current.update.value('initial'));
    expect(result.current.values).toBe(values);
    expect(result.current.partial).toBe(partial);
  });

  test('dispatch should mutate references when value is changed', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    const { values, partial } = result.current;
    act(() => result.current.update.value('update'));
    expect(result.current.values).not.toBe(values);
    expect(result.current.partial).not.toBe(partial);
  });

  test('updates should omit keys when values are reset', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    act(() => result.current.update.value('update'));
    act(() => result.current.update.value('initial'));
    expect(Object.keys(result.current.partial)).not.toContain('value');
  });

  test('reset should clear the form', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    act(() => result.current.update.value('update'));
    act(() => result.current.reset());
    expect(result.current.values.value).toBe('initial');
  });

  test('reset should clear the form using variable initializer', () => {
    let value = 'before';
    const { result, rerender } = renderHook(() => useForm({ value }));
    act(() => result.current.update.value('update'));
    value = 'after';
    rerender();
    act(() => result.current.reset());
    expect(result.current.values.value).toBe('after');
  });

  test('pristine should track form state', () => {
    const { result } = renderHook(() => useForm({ value: 'initial' }));
    act(() => result.current.update.value('update'));
    expect(result.current.pristine).toBe(false);
    act(() => result.current.reset());
    expect(result.current.pristine).toBe(true);
  });
});
