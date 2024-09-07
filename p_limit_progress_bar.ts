#!/usr/bin/env -S deno run -A

import cliProgress from "npm:cli-progress@3.12.0";
import pLimit, { type LimitFunction } from "npm:p-limit@6.1.0";
export { cliProgress, pLimit };
export type { LimitFunction };

export function createMultibar(): cliProgress.MultiBar {
  return new cliProgress.MultiBar({
    hideCursor: true,
    stopOnComplete: true,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    barGlue: "\u001b[33m",
  });
}

export class PlimitProgressBar {
  tot = 0;
  inProgress: Set<{ title: string; timestamp: number }> = new Set<
    { title: string; timestamp: number }
  >();
  bar: cliProgress.Bar;
  limit: LimitFunction;
  barTitle: string;
  constructor(
    max: number,
    barTitle: string,
    public multiBar: cliProgress.MultiBar = createMultibar(),
  ) {
    this.barTitle = barTitle;
    this.bar = this.multiBar.create(0, 0, { title: this.barTitle }, {
      format:
        " \u001b[92m{bar}\u001b[0m | {title} | {value}/{total} | {duration_formatted} | {steps}",
    });
    this.bar.update({ steps: "" });
    this.limit = pLimit(max);
    this.bar.stop();
  }
  updateSteps() {
    const steps = Array.from(this.inProgress.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((value) => value.title).join(", ");
    this.bar.update({ steps });
  }
  limitp<R>(fn: () => Promise<R>, title = ""): Promise<R> {
    this.bar.start();
    this.tot++;
    this.bar.setTotal(this.tot);
    this.bar.update({ title: this.barTitle });
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

export type PlimitpReturn = (
  fn: () => Promise<unknown>,
  title: string,
) => Promise<unknown>;

export function plimitp(
  max: number,
  barTitle: string = "",
  multiBar?: cliProgress.MultiBar,
): PlimitpReturn {
  const plimitProgressBar = new PlimitProgressBar(max, barTitle, multiBar);
  return (fn: () => Promise<unknown>, title = "") =>
    plimitProgressBar.limitp(fn, title);
}
