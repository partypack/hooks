import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export default function useDebounce<T>(
  initial: T | (() => T),
  duration?: number | undefined
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const [debounce, setDebounce] = useState<T>(state);

  useEffect(() => {
    const id = setTimeout(() => setDebounce(state), duration);
    return () => clearTimeout(id);
  }, [state, duration]);

  return [debounce, setState];
}
