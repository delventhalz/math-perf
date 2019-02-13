# math-perf
A simple GitHub page to test the performance of different JS math operations

## Contents

- [Usage](#usage)
    * [Browser](#browser)
        - [Web URL](#web-url)
        - [Serve Locally](#serve-locally)
        - [Console Usage](#console-usage)
    * [Node](#node)
- [About The Code](#about-the-code)
    * [The Test Loop](#the-test-loop)
    * [noop Test](#noop-test)
    * [MathPerf.runTest](#mathperfruntest)
- [Contributing](#contributing)
- [Credits](#credits)

## Usage

### Browser

#### Web URL

The tests are hosted a GitHub page, which you can visit here:

[https://delventhalz.github.io/math-perf/](https://delventhalz.github.io/math-perf/)

Click the run button next to a test will run it against random inputs of the specified type
for ten seconds and compare it to 10 seconds of running random inputs through a control
"noop" function. Takes a total of 20 seconds to complete.

#### Serve Locally

You could also of course serve the files locally. On a Mac you can do this out of the box from
your terminal:

```bash
cd math-perf/
python -m SimpleHTTPServer 8080
```

#### Console Usage

In your browser console, you can access the same exports available to Node by using the
`MathPerf` global object:

```javascript
MathPerf.tests.add(0); // 113

MathPerf.runTest('add', 'uint8');  // ...
```

### Node

From your Terminal, open the Node.js console:

```bash
cd math-perf/
node
```

Import the tests and test runner from `math-perf.js`. It contains the same properties as
the global object in the browser:

```javascript
const MathPerf = require('./math-perf.js');

MathPerf.tests.add(0); // 113

MathPerf.runTest('add', 'uint8');  // ...
```

## The Code

### The Test Loop

The [test loop](./math-perf.js#L82) contains the minimum amount of logic possible, but still
runs some code other than the operation being tests. It will:

1. Get `Date.now()`
2. Check that timestamp is less than the designated stop time
3. Check if a cache index is over the cache length
4. Set that index to zero or add one as appropriate
5. Fetch a random number from the cache at the index
6. _--> Run the test function with the fetched random number <--_
7. Repeat

### noop Test

The operations being tested are so fast that it is difficult to separate the time required
to loop over the inputs from the actual time being spent on the tested operation. In order
to attempt to parse this time out, every test will be run interspersed with noop loops, and
the totals of both are compared. Specifically the runner will report:

- The difference between the average test run and average noop run (in nanosecons)
- The ratio of the average test run compared to the average noop run (smaller is better)

Noop function:

```javascript
n => n
```

### MathPerf.runTest

**MathPerf.runTest(name, input) -> Results { runs, duration, noloop, ratio }**

Parameters:

- **name** _{string}_ - the name of the test to run (must be on `MathPerf.tests`)
- **input** _{string}_ - the type of random input to use ("uint8", "uint32", "maxint", or "float")

Results Properties:

- **runs** _{number}_ - The number of test loops completed
- **duration** _{number}_ - The raw duration for each whole loop
- **noloop** _{number}_ - The approximate duration for running the test (unreliable)
- **ratio** _{number}_ - The ratio of the tests loop time to the noop loop time

## Contributing

I have no plans to maintain this code base, but I encourage you to fork it and modify it
however you like.

## Credits

- Favicon source: [https://pixabay.com/en/math-function-symbol-icon-27248/](https://pixabay.com/en/math-function-symbol-icon-27248/)
