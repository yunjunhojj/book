export interface RenderLogEntry {
  step: "network" | "html" | "css" | "style" | "layout" | "paint" | "runtime";
  message: string;
  time: number;
}

export class RenderLogger {
  private entries: RenderLogEntry[] = [];

  add(step: RenderLogEntry["step"], message: string) {
    this.entries.push({ step, message, time: performance.now() });
  }

  getEntries() {
    return [...this.entries];
  }
}
