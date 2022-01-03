# Guard decorator

Guard takes one param. It should be a function that returns boolean. Its ok if the callback is async.

It can decorate both class and method. If target is a class, it applies the guard to all @Remote() methods

Example
```typescript
import {Controller} from "@vxf/core";
import {Guard} from "./guard.decorator";
import {RemoteContext} from "./remote-context";
import {Remote} from "./remote.decorator";

@Guard((ctx: RemoteContext) => ctx.source === '1')
@Controller('Test')
class T {

  // this method will never be triggered by a client
  // since source cannot be 1 and 2 at the same time
  @Guard((ctx: RemoteContext) => ctx.source === '2')
  private test(): void {}
  
  // this method can be triggered by a player with source === '1' && name === 'name'
  @Guard((ctx: RemoteContext) => GetPlayerName(ctx.source) === 'name')
  @Remote()
  private test2(): void {}

  // any client can trigger this remote method
  @Remote()
  private test3(): void{}
}

@Controller('Test2')
class T2 {

  // only a client with source === '2' can trigger the method
  @Guard((ctx: RemoteContext) => ctx.source === '2')
  @Remote()
  private test(): void {}

  // only a client with name === 'name' can trigger the method
  @Guard((ctx: RemoteContext) => GetPlayerName(ctx.source) === 'name')
  @Remote()
  private test2(): void {}

  // any client can trigger this remote method
  // since there is not guards
  @Remote()
  private test3(): void {}
}
```

You can use @Guard() and @FromSource() at the same time!