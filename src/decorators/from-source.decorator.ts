import { SOURCE_KEY } from '../const';

export const FromSource =
  (shouldThrowOnNull = true): ParameterDecorator =>
  (target, propertyKey, parameterIndex): void => {
    const prev = Reflect.getMetadata(SOURCE_KEY, target, propertyKey) || [];
    const type = (Reflect.getMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    ) || [])[parameterIndex];
    prev[parameterIndex] = { type, shouldThrowOnNull };
    Reflect.defineMetadata(SOURCE_KEY, prev, target, propertyKey);
  };
