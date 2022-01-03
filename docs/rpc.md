# RPC

RPC is a class with 2 useful methods

If you want to get some value from a client

```typescript
import {RPC} from "./RPC";

// will trigger clientContollerName.clientControllerMethodName
// and get the return result of the function
// can be null if the client leaves the server before it's resolved! 
const result = await RPC.get(global.source, 'clientContollerName', 'clientControllerMethodName', p1, p2, p3, p4, p5)

// dont wait for the result, just trigger the method and go further
RPC.call(global.source, 'clientContollerName', 'clientControllerMethodName', p1, p2, p3, p4, p5)
```