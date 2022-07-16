import {
  useRef,
  useState,
  useEffect,
  EffectCallback,
  DependencyList,
} from 'react';

export default function useDebouncedEffect(
  effect: EffectCallback,
  duration?: number | undefined,
  deps?: DependencyList
) {
  const callback = useRef<ReturnType<EffectCallback>>(undefined);
  const [state, setState] = useState(() => Symbol());
  const [debounce, setDebounce] = useState(state);

  useEffect(() => {
    const id = setTimeout(() => setDebounce(state), duration);
    return () => clearTimeout(id);
  }, [state, duration]);

  useEffect(() => void setState(() => Symbol()), deps);

  useEffect(() => {
    callback.current?.();
    callback.current = effect?.();
  }, [debounce]);

  // TODO: do we need to be concerned about invoking cleanups twice?
  useEffect(() => () => void callback.current?.(), []);
}
