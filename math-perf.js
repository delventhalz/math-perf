;(function() {
  'use strict';

  const LUT_RES = 1024;
  const RAND_CACHE_SIZE = 65521;

  const recentOutputs = {};
  const range = (len, fn) => Array(...Array(len)).map((_, i) => fn(i));

  // Tests
  const getTrigArray = trigFn => range(LUT_RES, i => trigFn((i * 2 * Math.PI / LUT_RES)));
  const LOOKUP = {
    SIN: getTrigArray(Math.sin),
    COS: getTrigArray(Math.cos),
    TAN: getTrigArray(Math.tan),
  };

  const tests = {
    noop: n => n,
    add: n => n + 113,
    multiply: n => n * 113,
    divide: n => n / 113,
    modulo: n => n % 113,

    power: n => n ** 113,
    pow: n => Math.pow(n,113),
    sqr: n => n * n,
    sqrt: n => Math.sqrt(n),

    sin: n => Math.sin(n),
    cos: n => Math.cos(n),
    tan: n => Math.tan(n),
    'sin-lut': n => LOOKUP.SIN[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)],
    'cos-lut': n => LOOKUP.COS[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)],
    'tan-lut': n => LOOKUP.TAN[Math.floor((n / (2 * Math.PI) % 1) * LUT_RES)],

    gt: n => n > 113,
    lte: n => n <= 113,
    eq: n => n === 113,

    floor: n => Math.floor(n),
    round: n => Math.round(n),
    'floor-bit': n => n | 0,
    abs: n => Math.abs(n),
    'abs-bit': n => { const mask = n >> 31; return (mask ^ n) - mask; },
    'is-odd': n => n % 2,
    'is-odd-bit': n => n & 1,

    quadratic: n => Math.pow(n, 2) + 17 * n - 113,
    factors: n => (n + 17) * (n - 113),
    'ten-ops': n =>  (n - 23) / (n + 17) * (n + 19) / (n - 13) * (n - 29) - 113,
    'is-shorter-sqrt': n => Math.sqrt(Math.pow(n - 17, 2) + Math.pow(n - 13, 2)) < 113,
    'is-shorter-sqr': n => Math.pow(n - 17, 2) + Math.pow(n - 13, 2) < Math.pow(113, 2),
  };

  // Random Inputs
  const getRandCache = xformFn => range(RAND_CACHE_SIZE, () => xformFn(Math.random()));
  const RAND_CACHES = {
    uint8: getRandCache(r => Math.floor(r * 256)),
    uint32: getRandCache(r => Math.floor(r * 4294967296)),
    maxint: getRandCache(r => Math.floor(r * Number.MAX_SAFE_INTEGER)),
    float: getRandCache(r => r * Number.MAX_SAFE_INTEGER),
  };

  const getRandFn = (type) => {
    const cache = RAND_CACHES[type];
    let i = -1;
    return () => {
      i = i < RAND_CACHE_SIZE ? i + 1 : 0;
      return cache[i];
    };
  };

  // Running Tests
  const loopTest = (name, input) => {
    recentOutputs[name] = [];
    const outputs = recentOutputs[name];
    const test = tests[name];
    const rand = getRandFn(input);
    const stop = Date.now() + 2500;

    // Test Loop
    while (Date.now() < stop) {
      outputs.push(test(rand()));
    }

    const runs = outputs.length;
    console.log(`${name}(${input}) runs:`, runs.toLocaleString());
    return runs;
  };

  const runTest = (name, input) => {
    console.log(`-------- testing ${name}(${input}) --------`);

    // Alternate between a test run and a noop run in alternating order
    const noopRun1 = loopTest('noop', input);
    const testRun1 = loopTest(name, input);
    const testRun2 = loopTest(name, input);
    const noopRun2 = loopTest('noop', input);
    const noopRun3 = loopTest('noop', input);
    const testRun3 = loopTest(name, input);
    const testRun4 = loopTest(name, input);
    const noopRun4 = loopTest('noop', input);

    const noopRuns = noopRun1 + noopRun2 + noopRun3 + noopRun4;
    const testRuns = testRun1 + testRun2 + testRun3 + testRun4;

    // 10,000,000,000 (i.e. 10 billion nanoseconds)
    const noopDuration = 10000000000 / noopRuns;
    const testDuration = 10000000000 / testRuns;

    const results = {
      runs: testRuns,
      duration: testDuration,
      noloop: testDuration - noopDuration,
      ratio: testDuration / noopDuration,
    }

    console.log(`\n${name}(${input}) total runs      :`, results.runs.toLocaleString());
    console.log(`${name}(${input}) duration (raw)    :`, `${results.duration.toFixed(2)}ns`);
    console.log(`${name}(${input}) duration (no loop):`, `${results.noloop.toFixed(2)}ns`);
    console.log(`${name}(${input}) duration (ratio)  :`, `${results.ratio.toFixed(2)}x`);
    console.log('-------------------------------------');

    return results;
  };

  // Exports
  const toExport = {
    recentOutputs,
    tests,
    runTest,
  };

  if (typeof window !== 'undefined') {
    window.MathPerf = toExport;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = toExport;
  }
})();
