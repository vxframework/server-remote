import { REMOTE_KEY } from '../const';
import { Reflector } from '@vxf/core';
import { RemoteMetadata } from '../types';

export const Remote =
  (): MethodDecorator =>
  (target, method: string): void => {
    Reflector.extend<RemoteMetadata>(target, REMOTE_KEY, { method });
  };
