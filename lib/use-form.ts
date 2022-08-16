import {
  useRef,
  useReducer,
  useMemo,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';
import isEqual from 'lodash/isEqual';

type FormReducerState = {
  initial: Record<string, unknown>;
  values: Record<string, unknown>;
  updates: Record<string, unknown>;
};

type FormReducerAction =
  | { type: 'set'; value: unknown; id?: string }
  | { type: 'reset'; initial: Record<string, unknown> };

function reducer(
  state: FormReducerState,
  action: FormReducerAction
): FormReducerState {
  switch (action.type) {
    case 'set': {
      if (!action.id) return state;

      const initial = state.initial[action.id];
      const update = state.updates[action.id];

      const value =
        action.value === undefined
          ? initial
          : typeof action.value === 'function'
          ? action.value(state.values[action.id])
          : action.value;

      if (isEqual(value, state.values[action.id])) return state;

      const isInitial = isEqual(value, initial);
      const values = { ...state.values, [action.id]: value };

      if (!isInitial && !isEqual(value, update)) {
        const updates = { ...state.updates, [action.id]: value };
        return { ...state, values, updates };
      }

      if (isInitial && update !== undefined) {
        const { [action.id]: _, ...updates } = state.updates;
        return { ...state, values, updates };
      }

      return { ...state, values };
    }

    case 'reset': {
      return {
        ...state,
        initial: action.initial,
        values: action.initial,
        updates: {},
      };
    }
  }
}

export type Form<T extends Record<string, any> = Record<string, unknown>> = {
  pristine: boolean;
  values: T;
  partial: Partial<T>;
  update: { [K in keyof T]: Dispatch<SetStateAction<T[K]>> };
  reset: (init?: Partial<T> | undefined) => void;
};

export default function useForm<
  T extends Record<string, any> = Record<string, unknown>
>(initial: Partial<T>): Form<T> {
  const initialRef = useRef(initial);

  const [{ values, updates }, dispatch] = useReducer(reducer, {}, () => {
    return {
      initial: initialRef.current,
      values: initialRef.current,
      updates: {},
    };
  });

  const update = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(initialRef.current).map((id) => [
          id,
          (value: any) => void dispatch({ type: 'set', value, id }),
        ])
      ),
    []
  );

  const reset = useCallback((initial?: Partial<T>) => {
    initialRef.current = initial ?? initialRef.current;
    dispatch({ type: 'reset', initial: initialRef.current });
  }, []);

  return {
    pristine: !Object.values(updates).length,
    values: values as T,
    partial: updates as Partial<T>,
    update: update as {
      [K in keyof T]: Dispatch<SetStateAction<T[K]>>;
    },
    reset,
  };
}
