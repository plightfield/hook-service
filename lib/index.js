import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
/**
 * bind state with a ref
 *
 * @export
 * @template T
 * @param {() => T} compute
 * @return {*}
 */
export function useBind(compute) {
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
export function createService(useFunc) {
    const Context = createContext(null);
    Context.displayName = useFunc.name || 'UnknownService';
    const Provider = (props) => {
        const { children, deps } = props;
        const result = useFunc(...deps);
        return useMemo(() => React.createElement(Context.Provider, { value: result }, children), [result, children]);
    };
    const useInject = () => {
        const result = useContext(Context);
        if (result === null) {
            throw new Error('cannot inject before provided');
        }
        return result;
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
export function useAsync(func, errCb, cb) {
    const configRef = useBind(() => ({
        func,
        cb,
        errCb,
    }));
    const [pending, setPending] = useState(() => ({
        value: new Set(),
    }));
    const [result, setResult] = useState(() => ({
        value: new Map(),
    }));
    const currentKey = useRef();
    const trigger = useCallback((...args) => {
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
        const deletePending = (key) => {
            setPending((res) => {
                res.value.delete(key);
                return {
                    value: res.value,
                };
            });
        };
        const handle = (res) => {
            var _a, _b;
            setResult((el) => {
                el.value.set(key, res);
                return { value: el.value };
            });
            deletePending(key);
            (_b = (_a = configRef.current).cb) === null || _b === void 0 ? void 0 : _b.call(_a, res);
        };
        const errHandle = (err) => {
            var _a, _b;
            deletePending(key);
            (_b = (_a = configRef.current).errCb) === null || _b === void 0 ? void 0 : _b.call(_a, err);
        };
        configRef.current
            .func(...args)
            .then(handle)
            .catch(errHandle);
    }, [configRef]);
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
export function next(name, event, data, parent) {
    const ifLocal = Object.is(parent, window);
    if (!parent || ifLocal) {
        document.dispatchEvent(new CustomEvent(name, { detail: { event, data } }));
    }
    else {
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
export function useListen(name = '', config, parent) {
    const configRef = useBind(() => config);
    useEffect(() => {
        if (!name)
            return;
        const ifLocal = Object.is(parent, window);
        const handle = (e) => {
            var _a, _b;
            if (parent && !ifLocal) {
                if (name !== e.origin)
                    return;
            }
            const { event, data } = !parent || ifLocal ? e.detail : e.data;
            if (event) {
                (_b = (_a = configRef.current)[event]) === null || _b === void 0 ? void 0 : _b.call(_a, data);
            }
        };
        if (!parent || ifLocal) {
            document.addEventListener(name, handle);
        }
        else {
            window.addEventListener('message', handle);
        }
        return () => {
            if (!parent || ifLocal) {
                document.removeEventListener(name, handle);
            }
            else {
                window.removeEventListener('message', handle);
            }
        };
    }, [name, parent, configRef]);
}
