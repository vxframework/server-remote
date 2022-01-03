import { Random } from '@vxf/core';

type Resolve = (value: unknown) => void;

type Handler = {
  resolve: Resolve;
  source: string;
};

export class RPC {
  constructor(name: string) {
    this.name = name;
  }

  private readonly name: string;

  private static callbacks: { [id: string]: Handler } = {};

  private static drop(src: string): void {
    for (const callbacksKey in RPC.callbacks) {
      if (RPC.callbacks[callbacksKey].source === src) {
        RPC.callbacks[callbacksKey].resolve(null);
        delete RPC.callbacks[callbacksKey];
      }
    }
  }

  public static respond(rid: string, value: unknown): void {
    const [resource, id] = rid.split(':');
    if (resource !== GetCurrentResourceName()) {
      return null;
    }
    const handler = RPC.callbacks[id];
    if (!handler) {
      console.error(`no handler for ${id}`);
    }
    delete RPC.callbacks[id];
    handler.resolve(value);
  }

  public static get<T>(
    target: string | number,
    controller: string,
    method: string,
    ...args: unknown[]
  ): Promise<T> {
    return new Promise<T>(resolve => {
      const id = Random.uuid();
      this.callbacks[id] = { resolve, source: target.toString() };
      emitNet(
        `vxf.rpc.get.${controller}`,
        target,
        method,
        `${GetCurrentResourceName()}:${id}`,
        ...args,
      );
    });
  }

  public static call(
    target: string | number,
    controller: string,
    method: string,
    ...args: unknown[]
  ): void {
    emitNet(`vxf.rpc.call.${controller}`, target, method, ...args);
  }

  public get<T>(
    target: string | number,
    method: string,
    ...args: unknown[]
  ): Promise<T> {
    return RPC.get(target, this.name, method, ...args);
  }

  public call(
    target: string | number,
    method: string,
    ...args: unknown[]
  ): void {
    return RPC.call(target, this.name, method, ...args);
  }
}

on('playerDropped', () => {
  const src = global.source.toString();
  const r = RPC as unknown as { drop: (src: string) => void };
  r.drop(src);
});
