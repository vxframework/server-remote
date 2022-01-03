import { IMetadataReader, Injectable, Reflector } from '@vxf/core';
import { RemoteListener } from '../lib/remote-listener';
import { GUARD_KEY, REMOTE_KEY, SOURCE_KEY } from '../const';
import { GuardFn, RemoteMetadata } from '../types';
import { RPC } from '../lib/RPC';
import { GuardHandler } from '../lib/guard-handler';
import { SourceInjectionValueIsNullException } from '../exceptions';
import { SourceInjector } from '../lib';

@Injectable()
export class RemoteMetadataReader implements IMetadataReader {
  private handlers: { [p: string]: RemoteListener } = {};

  constructor() {
    onNet('vxf.rpc.response', (id: string, value: string) => {
      RPC.respond(id, value);
    });
  }

  private getHandler(name: string): RemoteListener {
    if (!this.handlers[name]) {
      this.handlers[name] = new RemoteListener(name);
    }
    return this.handlers[name];
  }

  public read(target: unknown): void {
    const remotes = Reflector.get<RemoteMetadata[]>(target, REMOTE_KEY);

    if (!remotes) {
      return null;
    }
    const ctor = target.constructor;
    const controllerName = Reflector.getControllerName(ctor);

    if (!controllerName) {
      throw new Error(
        `Cannot create remote listeners for ${target.constructor.name}. Name is not specified via @Controller(name) decorator.`,
      );
    }

    const handler = this.getHandler(controllerName);

    const controllerGuards: GuardFn[] =
      Reflect.getMetadata(GUARD_KEY, target.constructor) || [];

    remotes.forEach(({ method: prop }) => {
      const method = target[prop].bind(target);

      const guards = [
        ...controllerGuards,
        ...(Reflect.getMetadata(GUARD_KEY, target, prop) || []),
      ];

      const injections = Reflect.getMetadata(SOURCE_KEY, target, prop) || [];

      const injector = new SourceInjector(injections);
      const guard = new GuardHandler(guards);

      handler.addHandler(prop, ctx => {
        const guardsResult = guard.try(ctx);

        if (guardsResult instanceof Promise) {
          return guardsResult.then(r => {
            if (!r) {
              return null;
            } else {
              try {
                injector.apply(ctx);
              } catch (e) {
                if (e instanceof SourceInjectionValueIsNullException) {
                  return null;
                }
                console.error(e);
              }
              return method(...ctx.args);
            }
          });
        }

        if (!guardsResult) {
          return null;
        }

        try {
          injector.apply(ctx);
        } catch (e) {
          if (e instanceof SourceInjectionValueIsNullException) {
            return null;
          }
          console.error(e);
        }
        return method(...ctx.args);
      });
    });
  }
}
