import { useMemo, useEffect, useReducer, DispatchWithoutAction } from 'react';
import stringify from 'json-stable-stringify';
import isEqual from 'lodash/isEqual';

export type ValidationResult = string | undefined | Promise<SyncedResult>;

export type SyncedResult = (string & { __synced__?: boolean }) | undefined;

export interface SyncCallback {
  (error?: string): SyncedResult;
}

export interface Validator {
  (value: any, id: string, sync?: SyncCallback): ValidationResult;
}

function isError(state: ValidationResult): state is string {
  return typeof state === 'string';
}

function isWaiting(state: ValidationResult): state is Promise<SyncedResult> {
  return state instanceof Promise;
}

type ValidationReducerState = {
  validators: Record<string, Validator[]>;
  errors: Record<string, string>;
  validation: Record<string, ValidationResult>;
  cancel: Record<string, DispatchWithoutAction | undefined>;
};

type ValidationReducerAction =
  | { type: 'update'; values: Record<string, unknown> }
  | { type: 'sync'; id: string; error?: SyncedResult }
  | { type: 'validate'; id: string }
  | { type: 'validate-all' };

function sync(error?: string): SyncedResult {
  return error ? Object.assign(error, { __synced__: true }) : error;
}

export type Validation<
  T extends Record<string, any> = Record<string, unknown>
> = {
  invalid: boolean;
  errors: { [K in keyof T]: string };
  waiting: { [K in keyof T]: boolean };
  validate: { [K in keyof T]: DispatchWithoutAction } & DispatchWithoutAction;
};

export default function useValidation<
  T extends Record<string, any> = Record<string, unknown>
>(values: T, validators: Record<string, Validator[]>): Validation {
  const [{ errors, validation }, dispatch] = useReducer(
    (state: ValidationReducerState, action: ValidationReducerAction) => {
      switch (action.type) {
        case 'update': {
          const entries = Object.entries(action.values).map(([id, value]) => {
            const results = state.validators[id]
              .map((validator) => validator(value, id, sync))
              .filter(Boolean);

            const error = results.filter(isError)[0];
            const promises = results.filter(isWaiting);

            const promise = promises.length
              ? Promise.race(promises)
              : undefined;

            if (error || promise) {
              state.cancel[id] = void state.cancel[id]?.();
            }

            if (promise) {
              const cancel: Promise<SyncedResult> = new Promise(
                (_, reject) => void (state.cancel[id] = reject)
              );

              Promise.race([promise, cancel])
                .then((error) => void dispatch({ type: 'sync', id, error }))
                .catch(() => undefined);
            }

            return [id, error ?? promise];
          });

          const validation = Object.fromEntries(entries) as Record<
            string,
            ValidationResult
          >;

          if (isEqual(validation, state.validation)) return state;
          return { ...state, validation };
        }

        case 'sync': {
          if (isError(state.validation[action.id])) return state;

          const error = action.error ? String(action.error) : action.error;
          const isEager = Boolean(action.error?.__synced__);
          const isErrorUpdate = !isEqual(state.errors[action.id], error);

          const isValidationUpdate = !isEqual(
            state.validation[action.id],
            error
          );

          if (!isErrorUpdate && !isValidationUpdate) return state;

          const validation = isValidationUpdate
            ? { ...state.validation, [action.id]: error }
            : state.validation;

          if (!isEager || !error || !isErrorUpdate)
            return { ...state, validation };

          const errors = { ...state.errors, [action.id]: error };
          return { ...state, validation, errors };
        }

        case 'validate': {
          if (isEqual(state.validation[action.id], state.errors[action.id]))
            return state;

          if (isError(state.validation[action.id])) {
            const errors = {
              ...state.errors,
              [action.id]: state.validation[action.id] as string,
            };
            return { ...state, errors };
          }

          const { [action.id]: _, ...errors } = state.errors;
          return { ...state, errors };
        }

        case 'validate-all': {
          const errors = Object.fromEntries(
            Object.entries(state.validation).filter(([, value]) =>
              isError(value)
            )
          ) as Record<string, string>;

          return isEqual(errors, state.errors) ? state : { ...state, errors };
        }
      }
    },
    {},
    () => ({
      validators,
      errors: {},
      validation: {},
      cancel: {},
    })
  );

  useEffect(
    () => void dispatch({ type: 'update', values }),
    [stringify(values)]
  );

  const validate = useMemo(
    () =>
      Object.assign(
        () => void dispatch({ type: 'validate-all' }),
        Object.fromEntries(
          Object.keys(values).map((id) => [
            id,
            () => void dispatch({ type: 'validate', id }),
          ])
        )
      ),
    []
  );

  const waiting = Object.fromEntries(
    Object.entries(validation).map(([id, value]) => [id, isWaiting(value)])
  );

  return {
    invalid: Boolean(Object.values(validation).filter(Boolean).length),
    waiting,
    errors,
    validate,
  };
}
