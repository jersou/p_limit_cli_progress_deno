#!/usr/bin/env -S deno run -A

import cliProgress from "npm:cli-progress@3.12.0";
import pLimit, { LimitFunction } from "npm:p-limit@5.0.0";
export { cliProgress, pLimit };
export type { LimitFunction };

export function createMultibar() {
  return new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    stopOnComplete: true,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    barGlue: "\u001b[33m",
  });
}

export class PlimitProgressBar {
  tot = 0;
  inProgress = new Set<{ title: string; timestamp: number }>();
  bar: cliProgress.Bar;
  limit: LimitFunction;
  constructor(
    max: number,
    barTitle: string,
    public multiBar: cliProgress.MultiBar = createMultibar(),
  ) {
    this.bar = this.multiBar.create(100, 0, { title: barTitle }, {
      format:
        " \u001b[92m{bar}\u001b[0m | {title} | {value}/{total} | {duration}s | {steps}",
    });
    this.limit = pLimit(max);
  }
  updateSteps() {
    const steps = Array.from(this.inProgress.values()).sort((a, b) =>
      a.timestamp - b.timestamp
    ).map((value) => value.title).join(", ");
    this.bar.update({ steps });
  }
  limitp<R>(fn: () => Promise<R>, title = ""): Promise<R> {
    this.tot++;
    this.bar.setTotal(this.tot);
    return this.limit(async () => {
      const curr = { title, timestamp: Date.now() };
      this.inProgress.add(curr);
      this.updateSteps();
      const ret = await fn();
      this.bar.increment();
      this.inProgress.delete(curr);
      this.updateSteps();
      return ret;
    });
  }
}
export function plimitp(
  max: number,
  barTitle: string,
  multiBar?: cliProgress.MultiBar,
) {
  const plimitProgressBar = new PlimitProgressBar(max, barTitle, multiBar);
  return (fn: () => Promise<unknown>, title = "") =>
    plimitProgressBar.limitp(fn, title);
}
