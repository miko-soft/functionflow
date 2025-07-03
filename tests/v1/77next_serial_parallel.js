const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return x + 1;
};

const f2 = (x, lib) => {
  const ff = lib.ff;
  console.log('f2', x);
  ff.next(10);
  return x + 2;
};

const f3 = (x, lib) => {
  console.log('f3', x);
  return x + 3;
};



const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 1000, rcListener: true }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  const funcs = [f1, f2, f3];
  await ff.serial(funcs);
  await ff.parallelRace(funcs);

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));


/*
Notice: f3 will not be executed inside serial() because f2 contains ff.next() which will force execution to jump on parallelrace()

--- serial --- start --- [0] f1 (1000 ms) --- x:: 5
f1 5

--- serial --- start --- [1] f2 (1000 ms) --- x:: 6
f2 6

   === next  ===


--- parallelRace --- start --- [race]  (1000 ms) --- x:: 8
f1 8
f2 8

   === next  ===

f3 8
OUTPUT::  9
*/
