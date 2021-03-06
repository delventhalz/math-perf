;(function() {
  'use strict';

  // Hard-coding all constants used in test loop in an attempt to
  // speed up as much as possible.
  // RAND_CACHE_SIZE = 65521;
  // LUT_RES = 1024;
  // PI_2 = 6.283185307179586;

  const LOOP_COUNT = 12;  // Must be even
  const LOOP_DURATION = 1250;

  const recentOutputs = [];
  const range = (len, fn) => Array(...Array(len)).map((_, i) => fn(i));

  // Tests
  const getTrigArray = trigFn => range(1024, i => trigFn((i * 2 * Math.PI / 1024)));  // LUT_RES
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
    'sin-lut': n => LOOKUP.SIN[Math.floor((n / 6.283185307179586 % 1) * 1024)],  // PI_2, LUT_RES
    'cos-lut': n => LOOKUP.COS[Math.floor((n / 6.283185307179586 % 1) * 1024)],  // PI_2, LUT_RES
    'tan-lut': n => LOOKUP.TAN[Math.floor((n / 6.283185307179586 % 1) * 1024)],  // PI_2, LUT_RES

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
  const getRandCache = xformFn => range(65521, () => xformFn(Math.random()));  // RAND_CACHE_SIZE
  const RAND_CACHES = {
    uint8: getRandCache(r => Math.floor(r * 2 ** 8)),
    uint32: getRandCache(r => Math.floor(r * 2 ** 32)),
    maxint: getRandCache(r => Math.floor(r * Number.MAX_SAFE_INTEGER)),
    float: getRandCache(r => r * Number.MAX_SAFE_INTEGER),
  };

  // Running Tests
  const loopTest = (name, input) => {
    recentOutputs.length = 0;
    const testFn = tests[name];
    const randCache = RAND_CACHES[input];
    let r = -1;
    const stop = Date.now() + LOOP_DURATION;

    // Test Loop
    while (Date.now() < stop) {
      r = r < 65521 ? r + 1 : 0;  // RAND_CACHE_SIZE
      recentOutputs.push(testFn(randCache[r]));
    }

    const runs = recentOutputs.length;
    console.log(`${name}(${input}) runs:`, runs.toLocaleString());
    return runs;
  };

  const runTest = (name, input) => {
    console.log(`-------- testing ${name}(${input}) --------`);

    // Alternate between a test run and a noop run in alternating order
    const { noopRuns, testRuns } = range(Math.floor(LOOP_COUNT / 2), () => {
      const testRun1 = loopTest(name, input);
      const noopRun1 = loopTest('noop', input);
      const noopRun2 = loopTest('noop', input);
      const testRun2 = loopTest(name, input);
      return {
        noopRuns: noopRun1 + noopRun2,
        testRuns: testRun1 + testRun2,
      };
    }).reduce((total, iteration) => ({
      noopRuns: total.noopRuns + iteration.noopRuns,
      testRuns: total.testRuns + iteration.testRuns,
    }));

    // Duration in nanoseconds
    const noopDuration = 1000000 * LOOP_COUNT * LOOP_DURATION / noopRuns;
    const testDuration = 1000000 * LOOP_COUNT * LOOP_DURATION  / testRuns;

    const results = {
      rate: Math.floor(testRuns / (LOOP_COUNT * LOOP_DURATION / 1000)),
      loop: testDuration,
      operation: testDuration - noopDuration,
      ratio: testDuration / noopDuration,
    };

    console.log(`\n${name}(${input}) rate of test runs : ${results.rate.toLocaleString()}/sec`);
    console.log(`${name}(${input}) duration (raw)    : ${results.loop.toFixed(2)}ns`);
    console.log(`${name}(${input}) duration (no loop): ${results.operation.toFixed(2)}ns`);
    console.log(`${name}(${input}) duration (ratio)  : ${results.ratio.toFixed(2)}x`);
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
