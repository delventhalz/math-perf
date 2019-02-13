'use strict';

window.outputs = {};
const noop = n => n;
const randInputFns = {
  uint8: () => Math.floor(Math.random() * 256),
  uint32: () => Math.floor(Math.random() * 4294967296),
  maxint: () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
  float: () => Math.random() * Number.MAX_SAFE_INTEGER,
};

const loopTest = (name, input, testFn, rand, duration) => {
  window.outputs[name]= [];
  const stop = Date.now() + duration;
  while (Date.now() < stop) {
    window.outputs[name].push(testFn(rand()));
  }

  const runs = window.outputs[name].length;
  console.log(`${name}(${input}) runs:`, runs.toLocaleString());
  return runs;
};

const getTestRunner = (name, testFn) => () => {
  const input = document.getElementById(`${name}-select`).value;
  const rand = randInputFns[input];

  console.log(`-------- testing ${name}(${input}) --------`);
  const noopRun1 = loopTest('noop', input, noop, rand, 2500);
  const testRun1 = loopTest(name, input, testFn, rand, 2500);
  const testRun2 = loopTest(name, input, testFn, rand, 2500);
  const noopRun2 = loopTest('noop', input, noop, rand, 2500);
  const noopRun3 = loopTest('noop', input, noop, rand, 2500);
  const testRun3 = loopTest(name, input, testFn, rand, 2500);
  const testRun4 = loopTest(name, input, testFn, rand, 2500);
  const noopRun4 = loopTest('noop', input, noop, rand, 2500);

  const noopRuns = noopRun1 + noopRun2 + noopRun3 + noopRun4;
  const testRuns = testRun1 + testRun2 + testRun3 + testRun4;
  const noopDuration = 10000000 / noopRuns;
  const testDuration = 10000000 / testRuns;

  console.log(`\n${name}(${input}) duration   (raw): ${testDuration.toFixed(3)}μs`);
  console.log(`${name}(${input}) duration (-noop): ${(testDuration - noopDuration).toFixed(3)}μs`);
  console.log(`${name}(${input}) duration (ratio): ${(testDuration / noopDuration).toFixed(2)}x`);
  console.log('-------------------------------------');
};

// Create an element, short name makes it easy to nest many calls
const e = (tag, { onclick, ...attrs }, ...children) => {
  const elem = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    elem.setAttribute(key, value);
  }
  if (onclick) {
    elem.onclick = onclick;
  }
  elem.append(...children);
  return elem;
};

const getInputSelect = (name) => (
  e('select', { id: `${name}-select` },
    e('option', { value: 'uint8' }, 'Uint8'),
    e('option', { value: 'uint32' }, 'Uint32'),
    e('option', { value: 'maxint' }, 'Max Safe Int'),
    e('option', { value: 'float' }, 'Float')));

const getRunner = (name, onclick) => (
  e('div', { class: 'perf-runner' },
    e('h2', {}, name),
    e('div', {},
      e('span', { style: 'padding-right:1em;' }, 'Inputs:'),
      getInputSelect(name),
      e('span', { style: 'padding-left:3em;' },
        e('button', { id: `${name}-button`, onclick }, 'Run')))));

// Append UI
document.getElementById('app').append(
  e('div', { id: 'header' },
    e('h1', {}, 'Math Perf')),
  getRunner('add', getTestRunner('add', n => n + 113)));
