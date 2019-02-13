'use strict';

const LUT_RES = 1024;

// Largest prime under 2^16
const RAND_CACHE_SIZE = 65521;

window.outputs = {};

const noop = n => n;
const range = (len, fn) => Array(...Array(len)).map((_, i) => fn(i));

const getTrigArray = trigFn => range(LUT_RES, i => trigFn((i * 2 * Math.PI / LUT_RES)));
const LOOKUP = {
  SIN: getTrigArray(Math.sin),
  COS: getTrigArray(Math.cos),
  TAN: getTrigArray(Math.tan),
};

const getRandCache = xformFn => range(RAND_CACHE_SIZE, () => xformFn(Math.random()));
const RAND_CACHES = {
  uint8: getRandCache(r => Math.floor(r * 256)),
  uint32: getRandCache(r => Math.floor(r * 4294967296)),
  maxint: getRandCache(r => Math.floor(r * Number.MAX_SAFE_INTEGER)),
  float: getRandCache(r => r * Number.MAX_SAFE_INTEGER),
};

// Gets a function which iterates over the appropriate rand cache indefinitely
const getRandFn = (type) => {
  const cache = RAND_CACHES[type];
  let i = -1;
  return () => {
    i = i < RAND_CACHE_SIZE ? i + 1 : 0;
    return cache[i];
  };
};

const loopTest = (name, input, testFn) => {
  window.outputs[name] = [];
  const outputs = window.outputs[name];
  const rand = getRandFn(input);
  const stop = Date.now() + 2500;

  // Test Loop
  while (Date.now() < stop) {
    outputs.push(testFn(rand()));
  }

  const runs = outputs.length;
  console.log(`${name}(${input}) runs:`, runs.toLocaleString());
  return runs;
};

// Run the test function and a noop control in an alternating pattern
// and print the results to the screen and console
const getTestRunner = (name, testFn) => () => {
  const input = document.getElementById(`${name}-select`).value;
  console.log(`-------- testing ${name}(${input}) --------`);

  // Alternate between a test run and a noop run in alternating order
  const noopRun1 = loopTest('noop', input, noop);
  const testRun1 = loopTest(name, input, testFn);
  const testRun2 = loopTest(name, input, testFn);
  const noopRun2 = loopTest('noop', input, noop);
  const noopRun3 = loopTest('noop', input, noop);
  const testRun3 = loopTest(name, input, testFn);
  const testRun4 = loopTest(name, input, testFn);
  const noopRun4 = loopTest('noop', input, noop);

  // Calculate results
  const noopRuns = noopRun1 + noopRun2 + noopRun3 + noopRun4;
  const testRuns = testRun1 + testRun2 + testRun3 + testRun4;
  const noopDuration = 10000000 / noopRuns;
  const testDuration = 10000000 / testRuns;

  // Format results
  const runsOutput = testRuns.toLocaleString();
  const durationOutput = `${testDuration.toFixed(3)}μs`;
  const noLoopOutput = `${(testDuration - noopDuration).toFixed(3)}μs`;
  const ratioOutput = `${(testDuration / noopDuration).toFixed(2)}x`;

  // Log results
  console.log(`\n${name}(${input}) total runs      :`, runsOutput);
  console.log(`${name}(${input}) duration (raw)    :`, durationOutput);
  console.log(`${name}(${input}) duration (no loop):`, noLoopOutput);
  console.log(`${name}(${input}) duration (ratio)  :`, ratioOutput);

  // Write results to UI
  document.getElementById(`${name}-result-runs`).innerText = runsOutput;
  document.getElementById(`${name}-result-raw`).innerText = durationOutput;
  document.getElementById(`${name}-result-no-loop`).innerText = noLoopOutput;
  document.getElementById(`${name}-result-ratio`).innerText = ratioOutput;

  console.log('-------------------------------------');
};
