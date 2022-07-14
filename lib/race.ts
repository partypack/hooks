import { useState, useCallback, Dispatch, DispatchWithoutAction } from 'react';

export type RaceCallback<T> = (
  promise: Promise<T>,
  callback: Dispatch<T>
) => void;

export default function useRace<T>(): [DispatchWithoutAction, RaceCallback<T>] {
  const [, setCancel] = useState<DispatchWithoutAction | undefined>(undefined);

  const startRace = useCallback(
    (promise: Promise<T>, callback: Dispatch<T>) => {
      const cancel = new Promise<T>((_, reject) =>
        setCancel((current) => {
          current?.();
          return reject;
        })
      );

      Promise.race([promise, cancel])
        .then(callback)
        .catch(() => undefined);
    },
    []
  );

  const cancel = useCallback(
    () => setCancel((current) => void current?.()),
    []
  );

  return [cancel, startRace];
}
