import { useState, useCallback, DispatchWithoutAction } from 'react';

export interface ToggleState {
  active: boolean;
  on: DispatchWithoutAction;
  off: DispatchWithoutAction;
  flip: DispatchWithoutAction;
}

export default function useToggle(init?: boolean): ToggleState {
  const [active, setActive] = useState(init ?? false);

  return {
    active,
    on: useCallback(() => void setActive(true), []),
    off: useCallback(() => void setActive(false), []),
    flip: useCallback(() => void setActive((current) => !current), []),
  };
}
