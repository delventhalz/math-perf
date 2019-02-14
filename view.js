;(function() {
  'use strict';

  // Creates an element, short name makes it easy to nest many calls
  const e = (tag, attrs, ...children) => {
    const elem = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      elem[key] = value;
    }
    elem.append(...children);
    return elem;
  };

  const getTestRunner = (name) => () => {
    document.getElementById(`${name}-is-running`).hidden = false;
    const input = document.getElementById(`${name}-select`).value;

    // Wait for DOM to redraw before running tests
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const { rate, loop, operation, ratio } = MathPerf.runTest(name, input);

        document.getElementById(`${name}-result-rate`).innerText = `${rate.toLocaleString()}/sec`;
        document.getElementById(`${name}-result-loop`).innerText = `${loop.toFixed(2)}ns`;
        document.getElementById(`${name}-result-operation`).innerText = `${operation.toFixed(2)}ns`;
        document.getElementById(`${name}-result-ratio`).innerText = `${ratio.toFixed(2)}x`;
        document.getElementById(`${name}-is-running`).hidden = true;
      });
    });
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

  const getIsRunningIndicator = (name) => (
    e('em', {
      id: `${name}-is-running`,
      style: 'margin-left:1em;',
      hidden: true
    }, 'Running...'));

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
        getRunButton(name),
        getIsRunningIndicator(name)),
      getOutputLine('Rate of test loops:', `${name}-result-rate`),
      getOutputLine('Duration per loop :', `${name}-result-loop`),
      getOutputLine('Operation duration:', `${name}-result-operation`),
      getOutputLine('Ratio vs noop func:', `${name}-result-ratio`)));

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
        '15 seconds against random inputs. It will also loop a simple noop ',
        'function for 15 seconds as a control. So each run will take a total ',
        'of 30 seconds to complete.'),

      e('p', {}, 'The Inputs:',
        e('ul', {},
          getDefListItem('Uint8', 'Random whole numbers from 0 - 255'),
          getDefListItem('Uint32', 'Random whole numbers from 0 - 4,294,967,295'),
          getDefListItem('Max Safe Int', 'Random whole numbers from 0 - 9,007,199,254,740,990'),
          getDefListItem('Float', 'Random decimal numbers from 0.0 - 9,007,199,254,740,990.0'))),

      e('p', {}, 'The Outputs:',
        e('ul', {},
          getDefListItem(
            'Rate of test loops',
            'Number of loops completed each second'),
          getDefListItem(
            'Duration per loop',
            'Raw duration per whole loop iteration in nanoseconds'),
          getDefListItem(
            'Operation duration',
            'Find actual operation duration by subtracting noop loop time (unreliable!)'),
          getDefListItem(
            'Ratio to noop rate',
            'How many times slower than the noop loops it was (lower is better)')))),

    getSection(
      'Noop',
      getTestComponent('noop')),

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

    e('div', { class: 'footer', style: 'margin-top:3em;font-style:italic;color:#888;' },
      'authored by Zac Delventhal, open-sourced under the MIT License'));
})();
