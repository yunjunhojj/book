type Job = () => void;

export class EventLoop {
  private tasks: Job[] = [];
  private microtasks: Job[] = [];
  private renderStep: Job;

  constructor(renderStep: Job) {
    this.renderStep = renderStep;
  }

  queueTask(job: Job) {
    this.tasks.push(job);
  }

  queueMicrotask(job: Job) {
    this.microtasks.push(job);
  }

  tick() {
    const task = this.tasks.shift();
    if (task) task();

    while (this.microtasks.length > 0) {
      const microtask = this.microtasks.shift()!;
      microtask();
    }

    this.renderStep();
  }
}
