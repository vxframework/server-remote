import { IConstructor } from '@vxf/core';

export type SourceInjectionType = {
  type: IConstructor;
  shouldThrowOnNull: boolean;
};
