## Vertex server remote package

It's used for remote communication between server & client
Something like ESX server callbacks or vRP tunnel system

### Example
Server
```typescript
import 'reflect-metadata';
import { Command, Controller, CommandReader, Logger, Vertex } from '@vxf/core';
import { RPC, RemoteReader } from '@vxf/svremote';

@Controller('Test')
export class TestController {
  @Command('testWithResult')
  private async testWithResult(src: string): Promise<void> {
    const result = await RPC.get(src, 'Test', 'countNumbers', 228, 1488);
    console.log(result); // 1716
  }
  
  @Command('justCall')
  private async justCall(src: string): Promise<void> {
    RPC.get(src, 'Test', 'justCall', 228, 1488);
  }
}



(() => {
  const app = new Vertex({
    controllers: [TestController],
    metadataReaders: [RemoteReader, CommandReader],
  });

  app.start();
})();
```

Client
```typescript
import { Vertex, Controller } from '@vxf/core';
import { RemoteReader, Remote } from '@vxf/clremote';

@Controller('Test')
export class TestController {
  @Remote()
  private justCall(param1: number, param2: number): void {
    console.log({ param1, param2 });
  }

  @Remote()
  private async countNumbers(param1: number, param2: number): Promise<number> {
    return param1 + param2;
  }
}

(() => {
  const app = new Vertex({
    controllers: [TestController],
    metadataReaders: [RemoteReader],
  });

  app.start();
})();
```

