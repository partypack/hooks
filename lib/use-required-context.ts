import { useContext, Context } from 'react';

export default function useRequiredContext<T>(context: Context<T | undefined>): T {
  const value = useContext<T | undefined>(context);

  if (!value) {
    throw new Error('Missing required context.');
  }

  return value;
}
