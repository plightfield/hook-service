# hook-service

> handle logic with five functions in react hooks

## Principle

> React's api is enough for most situations
> Must have way to handle event dispatch, especially when dispatch event form parent to child

## useBind

```typescript
import { useBind } from 'hook-service';

function useSome(name: string, password: string) {
  const bindRef = useBind(() => ({ name, password }));
  const test = useCallback(() => {
    // bindRef will take no changes in useCallback or useEffect
    console.log(bindRef.current.name, bindRef.current.password);
  }, [bindRef]);
}
```

## createService

```typescript
import React, { useState } from 'react';
import { createService } from 'hook-service';

function useSome(name: string) {
  const [state, setState] = useState(name);
  return {
    state,
    setState,
  };
}

// transform hook to service
const SomeService = createService(useSome);

function SomeComponent() {
  // service injected
  const { state, setState } = SomeService.useInject();

  return <div>name from service: {state}</div>;
}

// service provided
<SomeService.Provider deps={['new name']}>
  <SomeComponent />
</SomeService.Provider>;
```

## useAsync

```typescript
import { useAsync } from 'hook-service';

function useTest() {
  // loading will set after all content fulfilled or caught
  const { trigger, result, loading } = useAsync(
    () => fetch('http://some.com'),
    (res) => {
      // on fulfilled
    },
    (err) => {
      // on error caught
    },
  );
}
```

## next & useListen

```typescript
import { next, useListen } from 'hook-service';

interface CustomEvent {
  changeName: string;
  changePassword: string;
  setDisabled: boolean;
}

function useSome() {
  const [name, setName] = useState('');
  const [disabled, setDisabled] = useState(false);
  useListen(
    'someEventKey',
    {
      changeName(res) {
        setName(res);
      },
      setDisabled(res) {
        setDisabled(res);
      },
    },
    // parent.window  // also listen custom event from iframe layers above
  );
  return (
    <input
      value={name}
      onChange={(e) => {
        setName(e.target.value);
        next<CustomEvent>('someEventKey', 'changeName', e.target.value);
        // this will dispatch event across iframe layers
        next<CustomEvent>(
          'someEventKey',
          'changeName',
          e.target.value,
          parent.window,
        );
      }}
    />
  );
}
```

## getStorage & setStorage & useStorage

```typescript
// support string / number(int or float) / array / object
import { getStorage, setStorage, useStorage } from 'hook-service';

const name = getStorage('name', '');
setStorage('name', 'new name');

function useSome() {
  const [name, setName] = useStorage('name', '');
  const [config, setConfig] = useStorage('config', () => ({
    name: '',
    password: '',
  }));
}
```
