import { RemoteContext } from './remote-context';

export class RemoteListener {
  private handlers: { [p: string]: (ctx: RemoteContext) => unknown } = {};

  private respond(source: string | number, id: string, result: unknown): void {
    emitNet('vxf.rpc.response', source, id, result);
  }

  private request(method: string, id: string, ...payload: unknown[]): void {
    const source = global.source;
    const handler = this.handlers[method];

    if (!handler) {
      return this.respond(source, id, null);
    }

    const context = new RemoteContext(source, id, payload);

    const r = handler(context);

    if (r instanceof Promise) {
      r.then(r => this.respond(source, id, r));
    } else {
      this.respond(source, id, r);
    }
  }

  private call(method: string, ...payload: unknown[]): void {
    const handler = this.handlers[method];
    if (handler) {
      handler(new RemoteContext(source, null, payload));
    }
  }

  constructor(private readonly name: string) {
    onNet(`vxf.rpc.call.${name}`, this.call.bind(this));
    onNet(`vxf.rpc.request.${name}`, this.request.bind(this));
  }

  public addHandler(name: string, cb: (ctx: RemoteContext) => unknown): void {
    if (this.handlers[name]) {
      throw new Error(`Duplicate remote handler for ${this.name}.${name}`);
    }
    this.handlers[name] = cb;
  }
}
