# From source decorator

### @FromSource() decorator can be used only with @Remote() method!

### Examples

global.source injection

```typescript
import {FromSource} from "./from-source.decorator";
import {Remote} from "./remote.decorator";

@Controller('Test')
class T {
  @Remote()
  private test(@FromSource() src: string): void {}
}
```

custom injection & optional param

```typescript
import {FromSource} from "./from-source.decorator";
import {Controller} from "@vxf/core";
import {Remote} from "./remote.decorator";

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

// somewhere in code
SourceInjector.addFactory(Vehicle, ctx => Vehicle.fromSource(ctx.source))

@Controller('Test')
class T {
  //the method will be executed only if the player is inside vehicle
  @Remote()
  private setPlateText(@FromSource() veh: Vehicle, text: string): void {
    veh.plateText = text;
  }

  //the method will be executed, no matter if vehicle null or not
  //this is because false param passed 
  @Remote()
  private setPlateTextDangerous(@FromSource(false) veh: Vehicle | null, text: string): void {
    veh.plateText = text;
  }
}
```

You can use @Guard() and @FromSource() at the same time!