import React, { FC } from "react";
export default function createService<T>(useFunc: () => T, debug?: boolean): {
    connect: (Component: FC) => (props: any) => JSX.Element;
    useInject: () => T;
    ServiceContext: React.Context<T>;
    useService: () => {
        data: T;
        get: (key: string) => any;
        set: (key: string, value: any) => void;
        call: (key: string, ...params: any[]) => any;
    };
};
