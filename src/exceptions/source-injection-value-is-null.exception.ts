import { ServerException } from './server.exception';

export class SourceInjectionValueIsNullException extends ServerException {
  constructor(name: string) {
    super(`Value for @Source() param is null for factory ${name}`);
  }
}
