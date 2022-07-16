export default class SideEffect {
  private record: Record<string, boolean> = {};

  public get(id: string): boolean {
    return this.record[id];
  }

  public start(id: string) {
    this.record[id] = true;
  }

  public end(id: string) {
    if (!this.record[id]) throw Error(`${id} has not been started`);
    this.record[id] = false;
  }
}
