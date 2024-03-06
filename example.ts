#!/usr/bin/env -S deno run

import {
  createMultibar,
  plimitp,
  PlimitProgressBar,
} from "./p_limit_progress_bar.ts";
// =============================================================================
const generateTestData = () =>
  [...Array(30).keys()]
    .map((i) => ({ title: `data ${i}`, value: Math.random() }));
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// =============================================================================
const data1 = generateTestData();
const limitp = plimitp(10, "test 1");
const promises1 = data1.map(({ value, title }) =>
  limitp(() => sleep(100 + value * 1000), title)
);
await Promise.all(promises1);
await sleep(100);
console.log("test 1 done");
// =============================================================================
const data2 = generateTestData();
const plimitProgressBar2 = new PlimitProgressBar(10, "test 2");
const promises2 = data2.map(({ value, title }) =>
  plimitProgressBar2.limitp(() => sleep(100 + value * 4000), title)
);
await Promise.all(promises2);
plimitProgressBar2.multiBar.stop();
console.log("test 2 done");
// =============================================================================
const data3 = generateTestData();
const data4 = generateTestData();
const data5 = generateTestData();
const multiBar = createMultibar();
const plimitProgressBar3 = new PlimitProgressBar(6, "test 3", multiBar);
const plimitProgressBar4 = new PlimitProgressBar(8, "test 4", multiBar);
const plimitProgressBar5 = new PlimitProgressBar(5, "test 5", multiBar);
const promises = [
  ...data3.map(({ value, title }) =>
    plimitProgressBar3.limitp(() => sleep(100 + value * 1000), title)
  ),
  ...data4.map(({ value, title }) =>
    plimitProgressBar4.limitp(() => sleep(100 + value * 1000), title)
  ),
  ...data5.map(({ value, title }) =>
    plimitProgressBar5.limitp(() => sleep(100 + value * 1000), title)
  ),
];
await Promise.all(promises);
multiBar.stop();
console.log("test multibar done");
