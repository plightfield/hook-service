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
                console.log(`%c ${useFunc.name || "Unknown Service"}`, `color:white;background:#3f51b5`);
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
        const get = useCallback((key) => getTargetByKey(data, key), [data]);
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
            data[setterKey]((state) => {
                if (debug) {
                    console.log(`%c ${useFunc.name || "Unknown Service"} - ${setterKey} set`, `color:white;background:#3f51b5`);
                    console.log(value);
                }
                return setTargetByKey(state, keys.join("."), value);
            });
        }, [data]);
        return { data, get, set };
    };
    return { connect, useInject, ServiceContext, useService };
}
