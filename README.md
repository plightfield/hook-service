# hook-service

> use hooks with Context by just one function

## Typescript

```typescript
import React, { useState } from "react";
import createService from "hook-service";

// service's delcaration
const SomeService = createService(() => ({
  nameHook: useState(""),
}));

function SomeComponent() {
  // service injected
  const {
    nameHook: [name, setName],
  } = SomeService.useInject();

  return <div>name from service: {name}</div>;
}

// service provided
export default SomeService.connect(SomeComponent);
```

So you can see, there is no need to declare any Type annotations while using hook-service
