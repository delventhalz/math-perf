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
    getOutputLine('Number of runs in 10s :', `${name}-result-runs`),
    getOutputLine('Duration per run (raw):', `${name}-result-raw`),
    getOutputLine('Without loop (approx.):', `${name}-result-no-loop`),
    getOutputLine('Ratio to noop control :', `${name}-result-ratio`)));

// Append UI to DOM
document.getElementById('app').append(
  e('div', { class: 'header' },
    e('h1', {}, 'Math Perf'),
    e('p', {},
      'This page is a simple tool to try to test the performance of various ',
      'numerical operations across a variety of browsers and devices. ',
      'Clicking "Run", will loop the specified function repeatedly for ',
      '10 seconds against random inputs. It will also loop a simple noop',
      'function for 10 seconds as a control.'),
    e('p', {}, 'The Inputs:',
      e('ul', {},
        e('li', {},
          e('em', {}, 'Uint8:'),
          ' Random whole numbers from 0 - 255'),
        e('li', {},
          e('em', {}, 'Uint32:'),
          ' Random whole numbers from 0 - 4,294,967,295'),
        e('li', {},
          e('em', {}, 'Max Safe Int:'),
          ' Random whole numbers from 0 - 9,007,199,254,740,990'),
        e('li', {},
          e('em', {}, 'Float:'),
          ' Random decimal numbers from 0 - 9,007,199,254,740,990'))),
    e('p', {}, 'The Outputs:',
      e('ul', {},
        e('li', {},
          e('em', {}, 'Number of runs:'),
          ' Number of loops completed in 10 seconds'),
        e('li', {},
          e('em', {}, 'Duration per run:'),
          ' Raw duration per whole loop iteration in microseconds'),
        e('li', {},
          e('em', {}, 'Without loop:'),
          ' Subtracts average noop loop duration (questionable accuracy)'),
        e('li', {},
          e('em', {}, 'Ratio to noop:'),
          ' How many times slower than the noop loop each run was')))),
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
    e('h2', {}, 'Trig Functions'),
    getTestComponent('sin', n => Math.sin(n)),
    getTestComponent('cos', n => Math.cos(n)),
    getTestComponent('tan', n => Math.tan(n)),
    getTestComponent('sin-lut', n => LOOKUP.SIN[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)]),
    getTestComponent('cos-lut', n => LOOKUP.COS[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)]),
    getTestComponent('tan-lut', n => LOOKUP.TAN[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)]),
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
    e('hr', {})),
  e('div', { class: 'section' },
    e('h2', {}, 'Polynomials'),
    getTestComponent('quadratic', n => Math.pow(n, 2) + 17 * n - 113),
    getTestComponent('factors', n => (n + 17) * (n - 113)),
    getTestComponent('ten-ops', n =>  (n - 23) / (n + 17) * (n + 19) / (n - 13) * (n - 29) - 113),
    getTestComponent('is-shorter-sqrt', n => Math.sqrt(Math.pow(n - 17, 2) + Math.pow(n - 13, 2)) < 113, 5),
    getTestComponent('is-shorter-sqr', n => Math.pow(n - 17, 2) + Math.pow(n - 13, 2) < Math.pow(113, 2), 5),
    e('hr', {})),);
