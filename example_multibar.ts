#!/usr/bin/env -S deno run

import { createMultibar, PlimitProgressBar } from "./p_limit_progress_bar.ts";

const generateTestData = () =>
  [...Array(30).keys()]
    .map((i) => ({ title: `data ${i}`, value: Math.random() }));

const data1 = generateTestData();
const data2 = generateTestData();
const data3 = generateTestData();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const multiBar = createMultibar();
const bar1 = new PlimitProgressBar(6, "test 1", multiBar);
const bar2 = new PlimitProgressBar(8, "test 2", multiBar);
const bar3 = new PlimitProgressBar(5, "test 3", multiBar);

data1.map(({ value, title }) => bar1.limitp(() => sleep(value * 1000), title));
data2.map(({ value, title }) => bar2.limitp(() => sleep(value * 1000), title));
data3.map(({ value, title }) => bar3.limitp(() => sleep(value * 1000), title));
