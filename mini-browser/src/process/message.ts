export type BrowserMessage =
  | { type: "Navigate"; url: string }
  | { type: "PaintResult"; commands: string[] };

export class MessagePort<T> {
  private handlers: Array<(message: T) => void> = [];

  postMessage(message: T) {
    for (const handler of this.handlers) {
      handler(message);
    }
  }

  onMessage(handler: (message: T) => void) {
    this.handlers.push(handler);
  }
}
