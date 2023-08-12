const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return x + 1;
};

const f2 = (x, lib) => {
  console.log('f2', x);
  return x + 1;
};

const f3 = (x, lib) => {
  console.log('f3', x);
  return x + 1;
};



const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 800 }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.serial([f1, f2, f3]);
  await ff.repeat(3); // repeats ff.serial

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));
