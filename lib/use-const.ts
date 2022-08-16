import { useRef } from 'react';

export type InitFn<T> = () => T;

export default function useConst<T extends any>(init: T | InitFn<T>): T {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = typeof init === 'function' ? (init as InitFn<T>)() : init;
  }

  return ref.current as T;
}
