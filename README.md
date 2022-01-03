## Vertex server remote package

It's used for remote communication between server & client
Something like ESX server callbacks or vRP tunnel system

### Example
#### Being called
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

### RPC class
There are 2 usefull methods
```typescript
declare class RPC {
  static get<T>(target: string | number, controller: string, method: string, ...args: unknown[]): Promise<T>;
  static call(target: string | number, controller: string, method: string, ...args: unknown[]): void;
}
```
1. target is the source you want to call
2. controller should be the same as the string you've passed to client side @Controller() decorator
3. method is the method name you've decorated with @Remote()
4. ...args - whatever args you want to pass

"get" method returns the result of client side calculations.
it's a promise, so don't forget to await/ chain with .then()

"call" method returns nothing.
you can use it if you don't need the result of the client side calculations


### Guards
Guards are available only for remote methods. The decorator takes a callback with bool return type and only one argument that is RemoteContext
```typescript
export class RemoteContext {
  private readonly id: string;
  public readonly source: string;
  public readonly args: unknown[];
  public readonly metadata: { [p: string]: unknown } = {}; //you can set whatever you want to be here

  constructor(source: unknown, id: string, args: unknown[]) {
    this.source = source.toString();
    this.id = id;
    this.args = args;
  }
}

```

Example bellow would allow executing "call" method only to user with source 1
```typescript
class T {
  @Guard(ctx => ctx.source === '1')
  @Remote()
  private call(): void {
    
  }
}
```

You can set as much guards as you wish

### Source injector

Example bellow injects source as the 1st param of this method during remote call/request
```typescript
class T {
  @Remote()
  private call(@FromSource() src: string): void {
    
  }
}
```
You can make it inject whatever you want, even a vehicle, for example
```typescript
class Vehicle {

  constructor(public readonly handle: number) {
  }

  public set plateText(text: string) {
    SetVehicleNumberPlateText(this.handle, text)
  }

  public static fromSource(src: string): void {
    const ped = GetPlayerPed(src);
    const vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle === 0) {
      return null;
    }
    return new Vehicle(vehicle)
  }
}

class T {
  @Remote()
  private setPlateText(@FromSource() veh: Vehicle, text: string): void {
    veh.plateText = text;
  }
  
  @Remote()
  private setPlateTextDangerous(@FromSource(false) veh: Vehicle | null, text: string): void {
    veh.plateText = text;
  }
}

(() => {
  SourceInjector.addFactory(Vehicle, ctx => Vehicle.fromSource(ctx.source))
  const app = new Vertex({
    controllers: [TestController],
    metadataReaders: [RemoteReader],
  });

  app.start();
})();
```
setPlateText method will be executed only if the player is inside vehicle

setPlateTextDangerous method will be executed anyway, because false flag is passed into the decorator

factory for String type is predefined, it always returns the source