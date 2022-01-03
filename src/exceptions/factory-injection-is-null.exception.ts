import { ServerException } from './server.exception';

export class FactoryInjectionIsNullException extends ServerException {
  constructor(name: string, method: string, index: number) {
    super(
      `Factory for @Source() param is not found in ${name}.${method}. Parameter index: ${index} `,
    );
  }
}
