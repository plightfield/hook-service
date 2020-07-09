import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getTargetByKey, setTargetByKey } from "./mutations";

export default function createService<T>(useFunc: () => T, debug?: boolean) {
  const nullUseFunc: T = null as any;
  const ServiceContext = createContext(nullUseFunc)!;
  ServiceContext.displayName = (useFunc.name || "UnknownService") + "👇";
  const connect = (Component: FC) => (props: any) => {
    const value = (useFunc as any)();
    // value log
    useEffect(() => {
      if (debug) {
        console.log(
          `%c ${useFunc.name || "Unknown Service"}`,
          `color:white;background:#3f51b5`
        );
        console.log(value);
      }
    }, [value]);
    return (
      <ServiceContext.Provider value={value}>
        <Component {...props}></Component>
      </ServiceContext.Provider>
    );
  };

  const useInject = function () {
    return useContext(ServiceContext);
  };

  // handle data much easier
  const useService = function () {
    const data = useContext(ServiceContext);
    const get = useCallback((key: string) => getTargetByKey(data, key), [data]);
    const set = useCallback(
      (key: string, value: any) => {
        if (Object.prototype.toString.call(key) !== "[object String]") {
          throw new Error("key must be string");
        }
        const keys = key.split(".");
        const setterKey = keys.shift();
        if (!setterKey) {
          throw new Error("setterKey must be defined");
        }
        if (
          Object.prototype.toString.call((data as any)[setterKey]) !==
          "[object Function]"
        ) {
          throw new Error("setter must be function");
        }
        (data as any)[setterKey]((state: any) => {
          if (debug) {
            console.log(
              `%c ${useFunc.name || "Unknown Service"} - ${setterKey} set`,
              `color:white;background:#3f51b5`
            );
            console.log(value);
          }
          return setTargetByKey(state, keys.join("."), value);
        });
      },
      [data]
    );
    return { data, get, set };
  };
  return { connect, useInject, ServiceContext, useService };
}
