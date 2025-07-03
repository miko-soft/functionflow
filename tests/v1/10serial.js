const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f1 = (x, lib) => {
  x++;
  console.log('f1::', x);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2::', x);
  return x;
};

const f3 = function (x, lib) {
  x++;
  console.log('f3::', x);
  console.log('this::', this); // {}
  console.log('lib::', lib); // {evenEmitter,ff}
  return x;
};


// main
const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 800, rcListener: true }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.serial([f1, f2, f3, f1]);
  await ff.delay(3400);

  return ff.x;
};


// execute main
const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));




/*
--- serial --- start --- [0] f1 (800 ms) --- x:: 5
f1:: 6

--- serial --- start --- [1] f2 (800 ms) --- x:: 6
f2:: 7

--- serial --- start --- [2] f3 (800 ms) --- x:: 7
f3:: 8
this:: <ref *1> Object [global] {
  global: [Circular *1],
  clearInterval: [Function: clearInterval],
  clearTimeout: [Function: clearTimeout],
  setInterval: [Function: setInterval],
  setTimeout: [Function: setTimeout] {
    [Symbol(nodejs.util.promisify.custom)]: [Getter]
  },
  queueMicrotask: [Function: queueMicrotask],
  clearImmediate: [Function: clearImmediate],
  setImmediate: [Function: setImmediate] {
    [Symbol(nodejs.util.promisify.custom)]: [Getter]
  }
}
lib:: <ref *1> {
  eventEmitter: EventEmitter {
    _events: [Object: null prototype] {
      'ff-start': [Function (anonymous)],
      'ff-stop': [Function (anonymous)],
      'ff-pause': [Function (anonymous)]
    },
    _eventsCount: 3,
    _maxListeners: undefined,
    [Symbol(kCapture)]: false
  },
  ff: FunctionFlow {
    debug: true,
    msDelay: 800,
    eventEmitter: EventEmitter {
      _events: [Object: null prototype],
      _eventsCount: 3,
      _maxListeners: undefined,
      [Symbol(kCapture)]: false
    },
    status: 'start',
    lastExecuted: { method: 'serial', args: [Array] },
    iteration: 0,
    x: 7,
    lib: [Circular *1],
    delayID1: Timeout {
      _idleTimeout: 800,
      _idlePrev: null,
      _idleNext: null,
      _idleStart: 861,
      _onTimeout: [Function (anonymous)],
      _timerArgs: undefined,
      _repeat: null,
      _destroyed: true,
      [Symbol(refed)]: true,
      [Symbol(kHasPrimitive)]: false,
      [Symbol(asyncId)]: 7,
      [Symbol(triggerId)]: 0
    }
  }
}

--- serial --- start --- [3] f1 (800 ms) --- x:: 8
f1:: 9

   === delay 3400 ===

OUTPUT::  9

*/
