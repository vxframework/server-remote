# Example 
####Get value
Server
```typescript
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

#### Perform a call
Server
```typescript
@Controller('Test')
export class TestController {
  @Command('count')
  private async auth(src: string): Promise<void> {
    const result = await RPC.get(src, 'Test', 'countNumbers', 228, 1488);
    console.log(result);
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

@Controller('Test')
export class TestController {
  @Remote()
  private countNumbers(param1: number, param2: number): number {
    return param1 + param2;
  }
}

(() => {
  const app = new Vertex({
    controllers: [TestController],
    metadataReaders: [RemoteReader],
    logger: new Logger('Vertex'),
  });

  app.start();
})();
```