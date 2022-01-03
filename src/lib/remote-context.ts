export class RemoteContext {
  private readonly id: string;
  public readonly source: string;
  public readonly args: unknown[];
  public readonly metadata: { [p: string]: unknown } = {};

  constructor(source: unknown, id: string, args: unknown[]) {
    this.source = source.toString();
    this.id = id;
    this.args = args;
  }
}
