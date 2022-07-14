import {
  createContext,
  ReactElement,
  ReactNode,
  useRef,
  useMemo,
  useEffect,
  DependencyList,
} from 'react';

import useRequiredContext from './required-context';

type WhatChangedContextType = {
  keys: Record<string, number>;
};

const WhatChangedContext = createContext<WhatChangedContextType | undefined>(
  undefined
);

export interface WhatChangedProviderProps {
  children?: ReactNode;
}

export function WhatChangedProvider(
  props: WhatChangedProviderProps
): ReactElement {
  // https://www.youtube.com/watch?v=xRxAkNvnxhI&t=18s
  if (process.env.NODE_ENV !== 'development') return <>{props.children}</>;

  const context = useMemo(() => ({ keys: {} }), []);

  return (
    <WhatChangedContext.Provider value={context}>
      {props.children}
    </WhatChangedContext.Provider>
  );
}

export default function useWhatChanged(
  keyOrDeps: string | DependencyList,
  depsWithKey: DependencyList = []
) {
  // https://www.youtube.com/watch?v=xRxAkNvnxhI&t=18s
  if (process.env.NODE_ENV !== 'development') return;
  const { keys } = useRequiredContext(WhatChangedContext);
  const mounted = useRef(false);

  const [key, deps] =
    typeof keyOrDeps === 'string' ? [keyOrDeps, depsWithKey] : ['', keyOrDeps];

  const id = useMemo(() => {
    if (!keys[key]) keys[key] = 0;
    return `${key || 'effect'} ${keys[key]++}`;
  }, [keys]);

  const tracker = useMemo(() => [...deps], []);

  useEffect(() => {
    const changes = deps.reduce((acc, dep, index) => {
      const old = tracker[index];
      const prefix = old !== dep ? '➤' : '⏺';
      tracker[index] = dep;

      return {
        ...acc,
        [`${prefix} ${index}`]: { 'Old Value': old, 'New Value': dep },
      };
    }, {});

    console.log(mounted.current ? '⏰' : '🏁', id);
    console.table(changes);
    mounted.current = true;
  }, deps);
}
