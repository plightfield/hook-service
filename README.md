# hook-service

> handle logic with only ONE function 

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

As you can see, there is no need to declare any Type annotations while using hook-service
