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

// Run the test function and a noop control in an alternating pattern
// and print the results to the screen and console
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

  const runsOutput = testRuns.toLocaleString();
  const durationOutput = `${testDuration.toFixed(3)}μs`;
  const noLoopOutput = `${(testDuration - noopDuration).toFixed(3)}μs`;
  const ratioOutput = `${(testDuration / noopDuration).toFixed(2)}x`;

  console.log(`\n${name}(${input}) runs              :`, runsOutput);
  console.log(`${name}(${input}) duration (raw)    :`, durationOutput);
  console.log(`${name}(${input}) duration (no loop):`, noLoopOutput);
  console.log(`${name}(${input}) duration (ratio)  :`, ratioOutput);
  console.log('-------------------------------------');

  document.getElementById(`${name}-result-runs`).innerText = runsOutput;
  document.getElementById(`${name}-result-raw`).innerText = durationOutput;
  document.getElementById(`${name}-result-no-loop`).innerText = noLoopOutput;
  document.getElementById(`${name}-result-ratio`).innerText = ratioOutput;
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

// UI Components
const getFnSource = (fn) => (
  e('span', { style: 'font-family:monospace;font-style:oblique;color:#888;' },
    fn.toString()));

const getInputSelect = (name) => (
  e('select', { id: `${name}-select` },
    e('option', { value: 'uint8' }, 'Uint8'),
    e('option', { value: 'uint32' }, 'Uint32'),
    e('option', { value: 'maxint' }, 'Max Safe Int'),
    e('option', { value: 'float' }, 'Float')));

const getRunButton = (name, testFn) => (
  e('button', {
    id: `${name}-button`,
    style: 'margin-left:3em;',
    onclick: getTestRunner(name, testFn),
  }, 'Run'));

const getOutputLine = (label, id) => (
  e('div', {},
    e('span', { style: 'margin-right:1em;' }, label),
    e('em', { id })));

const getTestComponent = (name, testFn) => (
  e('div', { class: 'perf-runner', style: 'margin-top:2em;' },
    e('h3', {}, name),
    e('div', { style: 'margin-bottom:1em;' },
      getFnSource(testFn)),
    e('div', { style: 'margin-bottom:1em;' },
      e('strong', { style: 'margin-right:1em;' }, 'Inputs:'),
      getInputSelect(name),
      getRunButton(name, testFn)),
    getOutputLine('Runs in 10s  :', `${name}-result-runs`),
    getOutputLine('Raw duration :', `${name}-result-raw`),
    getOutputLine('Without loop :', `${name}-result-no-loop`),
    getOutputLine('Ratio to noop:', `${name}-result-ratio`)));

// Append UI to DOM
document.getElementById('app').append(
  e('div', { class: 'header' },
    e('h1', {}, 'Math Perf')),
  e('div', { class: 'section' },
    e('h2', {}, 'Arithmetic'),
    getTestComponent('add', n => n + 113),
    getTestComponent('multiply', n => n * 113),
    getTestComponent('divide', n => n / 113),
    getTestComponent('modulo', n => n % 113),
    e('hr', {})),
  e('div', { class: 'section' },
    e('h2', {}, 'Higher Maths'),
    getTestComponent('power', n => n ** 113),
    getTestComponent('pow', n => Math.pow(n,113)),
    getTestComponent('sqr', n => n * n),
    getTestComponent('sqrt', n => Math.sqrt(n)),
    e('hr', {})),
  e('div', { class: 'section' },
    e('h2', {}, 'Logic'),
    getTestComponent('gt', n => n > 113),
    getTestComponent('lte', n => n <= 113),
    getTestComponent('eq', n => n === 113),
    e('hr', {})),
  e('div', { class: 'section' },
    e('h2', {}, 'Number Manipulation'),
    getTestComponent('floor', n => Math.floor(n)),
    getTestComponent('round', n => Math.round(n)),
    getTestComponent('floor-bit', n => n | 0),
    getTestComponent('abs', n => Math.abs(n)),
    getTestComponent('abs-bit', n => { const mask = n >> 31; return (mask ^ n) - mask; }),
    getTestComponent('is-odd', n => n % 2),
    getTestComponent('is-odd-bit', n => n & 1),
    e('hr', {})));
