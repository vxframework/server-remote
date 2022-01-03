import { RemoteContext } from '../lib';
import { SourceInjectionType } from '../types';
import { IConstructor } from '@vxf/core';
import { SourceInjectionValueIsNullException } from '../exceptions';

type InjectionFactory = (ctx: RemoteContext) => unknown;

// eslint-disable-next-line @typescript-eslint/ban-types
type Type = IConstructor | Function;

export class SourceInjector {
  private static factories = new Map<Type, InjectionFactory>([]);

  constructor(private readonly injections: SourceInjectionType[]) {}

  public apply(ctx: RemoteContext): void {
    this.injections.forEach((el, i) => {
      const factory = SourceInjector.factories.get(el.type);
      if (!factory) {
        throw new Error(
          `Source injection factory for ${el.type.name} is not found`,
        );
      }
      const value = factory(ctx);
      if (!value && el.shouldThrowOnNull) {
        throw new SourceInjectionValueIsNullException(factory.name);
      }
      ctx.args.splice(i, 0, value);
    });
  }

  public static addFactory(type: Type, factory: InjectionFactory): void {
    this.factories.set(type, factory);
  }
}

SourceInjector.addFactory(String, ctx => ctx.source);
