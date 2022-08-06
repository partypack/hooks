import { useId, useRef, useEffect, DependencyList } from 'react';

export default function useTrace(
  keyOrDeps: string | DependencyList,
  depsWithKey: DependencyList = []
) {
  // https://www.youtube.com/watch?v=xRxAkNvnxhI&t=18s
  if (process.env.NODE_ENV !== 'development') return;
  const unique = useId();
  const mounted = useRef(false);

  const [key, deps] =
    typeof keyOrDeps === 'string'
      ? [`${keyOrDeps} (effect${unique})`, depsWithKey]
      : [`effect${unique}`, keyOrDeps];

  const tracker = useRef([...deps]);

  useEffect(() => {
    const changes = deps.reduce((acc: object, dep, index) => {
      const old = tracker.current[index];
      const prefix = old !== dep ? '➤' : '⏺';
      tracker.current[index] = dep;

      return {
        ...acc,
        [`${prefix} ${index}`]: { 'Old Value': old, 'New Value': dep },
      };
    }, {});

    console.log(mounted.current ? '⏰' : '🏁', key);
    console.table(changes);
    mounted.current = true;
  }, deps);
}
