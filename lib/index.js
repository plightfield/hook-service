import React, { createContext, useContext, useEffect, useCallback, } from "react";
import { getTargetByKey, setTargetByKey } from "./mutations";
export default function createService(useFunc, debug) {
    const nullUseFunc = null;
    const ServiceContext = createContext(nullUseFunc);
    ServiceContext.displayName = (useFunc.name || "UnknownService") + "👇";
    const connect = (Component) => (props) => {
        const value = useFunc();
        // value log
        useEffect(() => {
            if (debug) {
                console.log(`%c ${useFunc.name || "Unknown Service"} `, `color:white;background:#3f51b5`);
                console.log(value);
            }
        }, [value]);
        return (React.createElement(ServiceContext.Provider, { value: value },
            React.createElement(Component, Object.assign({}, props))));
    };
    const useInject = function () {
        return useContext(ServiceContext);
    };
    // handle data much easier
    const useService = function () {
        const data = useContext(ServiceContext);
        const get = useCallback((key) => getTargetByKey(data, key).value, [
            data,
        ]);
        const set = useCallback((key, value) => {
            if (Object.prototype.toString.call(key) !== "[object String]") {
                throw new Error("key must be string");
            }
            const keys = key.split(".");
            const setterKey = keys.shift();
            if (!setterKey) {
                throw new Error("setterKey must be defined");
            }
            if (Object.prototype.toString.call(data[setterKey]) !==
                "[object Function]") {
                throw new Error("setter must be function");
            }
            if (debug) {
                console.log(`%c set ${useFunc.name || "Unknown Service"} - ${setterKey} `, `color:white;background:#009688`);
                console.log(value);
            }
            data[setterKey]((state) => setTargetByKey(state, keys.join("."), value));
        }, [data]);
        const call = useCallback((key, ...params) => {
            if (debug) {
                console.log(`%c call ${useFunc.name || "Unknown Service"} - ${key} `, `color:white;background:#2196F3`);
                console.log(params);
            }
            return data[key](...params);
        }, [data]);
        return { data, get, set, call };
    };
    return { connect, useInject, ServiceContext, useService };
}
