import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * bind state with a ref
 *
 * @export
 * @template T
 * @param {() => T} compute
 * @return {*}
 */
export function useBind<T>(compute: () => T) {
  const result = useRef(compute());
  useEffect(() => {
    result.current = compute();
  });
  return result;
}

/**
 * create a service by custom hook function
 *
 * @export
 * @template P
 * @template R
 * @param {(...args: P) => R} useFunc
 * @return {*}
 */
export function createService<P extends any[], R>(useFunc: (...args: P) => R) {
  const Context = createContext<any>(null);
  Context.displayName = useFunc.name || 'UnknownService';
  const Provider = (props: PropsWithChildren<{ deps: P }>) => {
    const { children, deps } = props;
    const result = useFunc(...deps);
    return useMemo(
      () => <Context.Provider value={result}>{children}</Context.Provider>,
      [result, children],
    );
  };
  const useInject = () => {
    const result = useContext(Context);
    if (result === null) {
      throw new Error('cannot inject before provided');
    }
    return result as R;
  };
  return {
    Provider,
    useInject,
  };
}

/**
 * event edge trigger with loading state
 *
 * @template P
 * @template R
 * @param {(...args: P) => Promise<R>} func
 * @param {(err: Error) => void} [errCb]
 * @param {(val: R) => void} [cb]
 * @return {*}
 */
export function useAsync<P extends any[], R>(
  func: (...args: P) => Promise<R>,
  errCb?: (err: Error) => void,
  cb?: (val: R) => void,
) {
  const configRef = useBind(() => ({
    func,
    cb,
    errCb,
  }));
  const [pending, setPending] = useState(() => ({
    value: new Set<symbol>(),
  }));
  const [result, setResult] = useState(() => ({
    value: new Map<symbol, R | undefined>(),
  }));
  const currentKey = useRef<symbol | undefined>();
  const trigger = useCallback(
    (...args: P) => {
      const key = Symbol('pending');
      currentKey.current = key;
      setPending((res) => {
        res.value.add(key);
        return { value: res.value };
      });
      setResult((res) => {
        res.value.set(key, undefined);
        return { value: res.value };
      });
      const deletePending = (key: symbol) => {
        setPending((res) => {
          res.value.delete(key);
          return {
            value: res.value,
          };
        });
      };
      const handle = (res: R) => {
        setResult((el) => {
          el.value.set(key, res);
          return { value: el.value };
        });
        deletePending(key);
        configRef.current.cb?.(res);
      };
      const errHandle = (err: Error) => {
        deletePending(key);
        configRef.current.errCb?.(err);
      };
      configRef.current
        .func(...args)
        .then(handle)
        .catch(errHandle);
    },
    [configRef],
  );
  const loading = useMemo(() => pending.value.size > 0, [pending]);
  const usedResult = useMemo(() => {
    if (currentKey.current) {
      return result.value.get(currentKey.current);
    }
  }, [result]);
  return { trigger, loading, result: usedResult };
}

/**
 * dispatch custom event
 *
 * @export
 * @template E
 * @template Ev
 * @param {string} name
 * @param {Ev} event
 * @param {E[Ev]} data
 * @param {Window} [parent] 发送目标 window （微前端）
 */
export function next<E extends { [key: string]: any }, Ev extends keyof E>(
  name: string,
  event: Ev,
  data: E[Ev],
  parent?: Window,
) {
  const ifLocal = Object.is(parent, window);
  if (!parent || ifLocal) {
    document.dispatchEvent(new CustomEvent(name, { detail: { event, data } }));
  } else {
    parent.postMessage({ event, data }, name);
  }
}

/**
 * listen custom event
 *
 * @export
 * @template E
 * @param {string} [name='']
 * @param {{
 *     [key in keyof E]?: (val: E[key]) => void;
 *   }} config
 * @param {Window} [parent] 目标 window（微前端）
 */
export function useListen<E extends { [key: string]: any }>(
  name: string = '',
  config: {
    [key in keyof E]?: (val: E[key]) => void;
  },
  parent?: Window,
) {
  const configRef = useBind(() => config);
  useEffect(() => {
    if (!name) return;
    const ifLocal = Object.is(parent, window);
    const handle = (e: any) => {
      if (parent && !ifLocal) {
        if (name !== e.origin) return;
      }
      const { event, data } = !parent || ifLocal ? e.detail : e.data;
      if (event) {
        configRef.current[event]?.(data);
      }
    };
    if (!parent || ifLocal) {
      document.addEventListener(name, handle);
    } else {
      window.addEventListener('message', handle);
    }
    return () => {
      if (!parent || ifLocal) {
        document.removeEventListener(name, handle);
      } else {
        window.removeEventListener('message', handle);
      }
    };
  }, [name, parent, configRef]);
}
