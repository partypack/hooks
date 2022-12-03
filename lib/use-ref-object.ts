import { useRef, RefObject } from 'react';

export default function useRefObject<T extends any>(value: T): RefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
