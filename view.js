;(function() {
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

  const getTestRunner = (name) => () => {
    const input = document.getElementById(`${name}-select`).value;

    const { runs, duration, noloop, ratio } = MathPerf.runTest(name, input);

    document.getElementById(`${name}-result-runs`).innerText = runs.toLocaleString();
    document.getElementById(`${name}-result-raw`).innerText = `${duration.toFixed(2)}ns`;
    document.getElementById(`${name}-result-no-loop`).innerText = `${noloop.toFixed(2)}ns`;
    document.getElementById(`${name}-result-ratio`).innerText = `${ratio.toFixed(2)}x`;
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

  const getFnSource = (name) => (
    e('span', { style: 'font-family:monospace;color:#888;' },
      MathPerf.tests[name].toString()));

  const getInputSelect = (name) => (
    e('select', { id: `${name}-select` },
      e('option', { value: 'uint8' }, 'Uint8'),
      e('option', { value: 'uint32' }, 'Uint32'),
      e('option', { value: 'maxint' }, 'Max Safe Int'),
      e('option', { value: 'float' }, 'Float')));

  const getRunButton = (name) => (
    e('button', {
      id: `${name}-button`,
      style: 'margin-left:3em;',
      onclick: getTestRunner(name),
    }, 'Run'));

  const getOutputLine = (label, id) => (
    e('div', {},
      e('span', { style: 'margin-right:1em;' }, label),
      e('em', { id })));

  const getTestComponent = (name) => (
    e('div', { class: 'perf-runner', style: 'margin-top:2em;' },
      e('h3', {}, name),
      e('div', { style: 'margin-bottom:1em;' },
        getFnSource(name)),
      e('div', { style: 'margin-bottom:1em;' },
        e('strong', { style: 'margin-right:1em;' }, 'Inputs:'),
        getInputSelect(name),
        getRunButton(name)),
      getOutputLine('Number of runs in 10s :', `${name}-result-runs`),
      getOutputLine('Duration per run (raw):', `${name}-result-raw`),
      getOutputLine('Without loop (approx.):', `${name}-result-no-loop`),
      getOutputLine('Ratio to noop control :', `${name}-result-ratio`)));

  // Append UI to DOM
  document.getElementById('app').append(
    e('div', { class: 'header' },
      e('h1', {}, 'Math Perf'),

      e('div', {},
        '[',
        e('a', {
          href: 'https://github.com/delventhalz/math-perf',
          target: '_blank',
        }, 'GitHub'),
        ']'),

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
            'Raw duration per whole loop iteration in nanoseconds'),
          getDefListItem(
            'Without loop',
            'Tries to get actual operation duration by subtracting noop time'),
          getDefListItem(
            'Ratio to noop',
            'How many times slower than the noop loop each run was (lower better)')))),

    getSection(
      'Arithmetic',
      getTestComponent('add'),
      getTestComponent('multiply'),
      getTestComponent('divide'),
      getTestComponent('modulo')),

    getSection(
      'Higher Math',
      getTestComponent('power'),
      getTestComponent('pow'),
      getTestComponent('sqr'),
      getTestComponent('sqrt')),

    getSection(
      'Trig Functions',
      getTestComponent('sin'),
      getTestComponent('cos'),
      getTestComponent('tan'),
      getTestComponent('sin-lut'),
      getTestComponent('cos-lut'),
      getTestComponent('tan-lut')),

    getSection(
      'Logic',
      getTestComponent('gt'),
      getTestComponent('lte'),
      getTestComponent('eq')),

    getSection(
      'Number Manipulation',
      getTestComponent('floor'),
      getTestComponent('round'),
      getTestComponent('floor-bit'),
      getTestComponent('abs'),
      getTestComponent('abs-bit'),
      getTestComponent('is-odd'),
      getTestComponent('is-odd-bit')),

    getSection(
      'Polynomials',
      getTestComponent('quadratic'),
      getTestComponent('factors'),
      getTestComponent('ten-ops'),
      getTestComponent('is-shorter-sqrt'),
      getTestComponent('is-shorter-sqr')),

    e('div', { class: 'footer', style: 'margin-top:3em;font-style:italic;color:#fff;' },
      'authored by Zac Delventhal, open-sourced under the MIT License'));
})();
