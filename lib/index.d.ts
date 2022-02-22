import React, { PropsWithChildren } from 'react';
/**
 * bind state with a ref
 *
 * @export
 * @template T
 * @param {() => T} compute
 * @return {*}
 */
export declare function useBind<T>(compute: () => T): React.MutableRefObject<T>;
/**
 * callback with none dependency
 *
 * @export
 * @template P
 * @template R
 * @param {(...args: P) => R} cb
 * @return {*}
 */
export declare function useCb<P extends any[], R>(cb: (...args: P) => R): React.Dispatch<P>;
/**
 * create a service by custom hook function
 *
 * @export
 * @template P
 * @template R
 * @param {(...args: P) => R} useFunc
 * @return {*}
 */
export declare function createService<P extends any[], R>(useFunc: (...args: P) => R): {
    Provider: (props: PropsWithChildren<{
        deps: P;
    }>) => JSX.Element;
    useInject: () => R;
};
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
export declare function useAsync<P extends any[], R>(func: (...args: P) => Promise<R>, errCb?: (err: Error) => void, cb?: (val: R) => void): {
    trigger: (...args: P) => void;
    loading: boolean;
    result: R | undefined;
};
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
export declare function next<E extends {
    [key: string]: any;
}, Ev extends keyof E>(name: string, event: Ev, data: E[Ev], parent?: Window): void;
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
export declare function useListen<E extends {
    [key: string]: any;
}>(name: string | undefined, config: {
    [key in keyof E]?: (val: E[key]) => void;
}, parent?: Window): void;
declare type CanStore = string | number | any[] | {
    [key: string]: any;
} | null;
/**
 * set storage value
 *
 * @export
 * @template T
 * @param {string} key
 * @param {T} val
 * @param {Storage} [handler=localStorage]
 */
export declare function setStorage<T extends CanStore>(key: string, val: T, handler?: Storage): void;
/**
 * get storage value
 *
 * @export
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @param {Storage} [handler=localStorage]
 * @return {*}  {T}
 */
export declare function getStorage<T extends CanStore>(key: string, initialValue: T, handler?: Storage): T;
/**
 * storage using hook
 *
 * @export
 * @template T
 * @param {string} key
 * @param {(T | (() => T))} initialValue
 * @param {Storage} [handler=localStorage]
 * @return {*}
 */
export declare function useStorage<T extends CanStore>(key: string, initialValue: T | (() => T), handler?: Storage): readonly [T, React.Dispatch<React.SetStateAction<T>>];
export {};
