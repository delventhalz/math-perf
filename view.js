'use strict';

// Creates an element, short name makes it easy to nest many calls
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
const getDefListItem = (key, definition) => (
  e('li', {},
    e('em', {}, `${key}:`),
    ` ${definition}`));

const getSection = (header, ...children) => (
  e('div', { class: 'section' },
    e('h2', {}, header),
    ...children,
    e('hr', {})));

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
        getDefListItem('Uint8', 'Random whole numbers from 0 - 255'),
        getDefListItem('Uint32', 'Random whole numbers from 0 - 4,294,967,295'),
        getDefListItem('Max Safe Int', 'Random whole numbers from 0 - 9,007,199,254,740,990'),
        getDefListItem('Float', 'Random decimal numbers from 0 - 9,007,199,254,740,990'))),

    e('p', {}, 'The Outputs:',
      e('ul', {},
        getDefListItem(
          'Number of runs',
          'Number of loops completed in 10 seconds'),
        getDefListItem(
          'Duration per run',
          'Raw duration per whole loop iteration in microseconds'),
        getDefListItem(
          'Without loop',
          'Tries to get actual operation duration by subtracting noop time'),
        getDefListItem(
          'Ratio to noop',
          'How many times slower than the noop loop each run was (lower better)')))),

  getSection(
    'Arithmetic',
    getTestComponent('add', n => n + 113),
    getTestComponent('multiply', n => n * 113),
    getTestComponent('divide', n => n / 113),
    getTestComponent('modulo', n => n % 113)),

  getSection(
    'Higher Math',
    getTestComponent('power', n => n ** 113),
    getTestComponent('pow', n => Math.pow(n,113)),
    getTestComponent('sqr', n => n * n),
    getTestComponent('sqrt', n => Math.sqrt(n))),

  getSection(
    'Trig Functions',
    getTestComponent('sin', n => Math.sin(n)),
    getTestComponent('cos', n => Math.cos(n)),
    getTestComponent('tan', n => Math.tan(n)),
    getTestComponent('sin-lut', n => LOOKUP.SIN[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)]),
    getTestComponent('cos-lut', n => LOOKUP.COS[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)]),
    getTestComponent('tan-lut', n => LOOKUP.TAN[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)])),

  getSection(
    'Logic',
    getTestComponent('gt', n => n > 113),
    getTestComponent('lte', n => n <= 113),
    getTestComponent('eq', n => n === 113)),

  getSection(
    'Number Manipulation',
    getTestComponent('floor', n => Math.floor(n)),
    getTestComponent('round', n => Math.round(n)),
    getTestComponent('floor-bit', n => n | 0),
    getTestComponent('abs', n => Math.abs(n)),
    getTestComponent('abs-bit', n => { const mask = n >> 31; return (mask ^ n) - mask; }),
    getTestComponent('is-odd', n => n % 2),
    getTestComponent('is-odd-bit', n => n & 1)),

  getSection(
    'Polynomials',
    getTestComponent('quadratic', n => Math.pow(n, 2) + 17 * n - 113),
    getTestComponent('factors', n => (n + 17) * (n - 113)),
    getTestComponent('ten-ops', n =>  (n - 23) / (n + 17) * (n + 19) / (n - 13) * (n - 29) - 113),
    getTestComponent('is-shorter-sqrt', n => Math.sqrt(Math.pow(n - 17, 2) + Math.pow(n - 13, 2)) < 113, 5),
    getTestComponent('is-shorter-sqr', n => Math.pow(n - 17, 2) + Math.pow(n - 13, 2) < Math.pow(113, 2), 5)));
