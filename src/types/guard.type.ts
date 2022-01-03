import { RemoteContext } from '../lib/remote-context';

export type GuardFn = (ctx: RemoteContext) => boolean | Promise<boolean>;
