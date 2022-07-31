import { useState, useCallback, DispatchWithoutAction } from 'react';

export interface ToggleState {
  value: boolean;
  on: DispatchWithoutAction;
  off: DispatchWithoutAction;
  toggle: DispatchWithoutAction;
}

export default function useToggle(init?: boolean): ToggleState {
  const [value, setValue] = useState(init ?? false);

  return {
    value,
    on: useCallback(() => void setValue(true), []),
    off: useCallback(() => void setValue(false), []),
    toggle: useCallback(() => void setValue((current) => !current), []),
  };
}
