import { renderHook } from '@testing-library/react-hooks';
import useDebouncedEffect from '../lib/useDebouncedEffect';
import SideEffect from './util/SideEffect';

function effect(id: string, record: SideEffect) {
  return () => {
    record.start(id);
    return () => void record.end(id);
  };
}

describe('useDebouncedEffect', () => {
  test('should initialize', () => {
    renderHook(() => useDebouncedEffect(() => undefined, 100, []));
  });

  test('should produce effects', () => {
    const record = new SideEffect();

    renderHook(({ id }) => useDebouncedEffect(effect(id, record), 100, [id]), {
      initialProps: { id: 'first' },
    });

    expect(record.get('first')).toBe(true);
  });

  test('effects should be debounced', async () => {
    const record = new SideEffect();

    const { rerender, waitForNextUpdate } = renderHook(
      ({ id }) => useDebouncedEffect(effect(id, record), 100, [id]),
      {
        initialProps: { id: 'first' },
      }
    );

    rerender({ id: 'second' });
    expect(record.get('first')).toBe(true);
    await waitForNextUpdate();
    expect(record.get('first')).toBe(false);
    expect(record.get('second')).toBe(true);
  });
});
