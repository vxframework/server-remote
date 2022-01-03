import { GuardFn } from '../types';
import { Reflector } from '@vxf/core';
import { GUARD_KEY } from '../const';

export const Guard =
  (guard: GuardFn): ClassDecorator & MethodDecorator =>
  (target, prop?: string): void => {
    Reflector.extend(target, GUARD_KEY, guard, prop);
  };
