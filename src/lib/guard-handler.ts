import { GuardFn } from '../types';
import { RemoteContext } from './remote-context';

export class GuardHandler {
  private readonly len: number;
  constructor(private readonly guards: GuardFn[]) {
    this.len = guards.length;
  }

  public try(ctx: RemoteContext): boolean | Promise<boolean> {
    const promises: Promise<boolean>[] = [];
    for (let i = 0; i < this.len; i++) {
      const result = this.guards[i](ctx);
      if (!result) {
        return false;
      }
      if (result instanceof Promise) {
        promises.push(result);
      }
    }
    if (promises.length === 0) {
      return true;
    }
    return Promise.all(promises).then(
      r => r.find(el => el === false) === undefined,
    );
  }
}
