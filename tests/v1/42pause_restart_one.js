const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f1 = async (x, lib) => {
  const ff = lib.ff;
  console.log('f1', x);
  ff.pause();
  return x + 1;
};



const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 1000 }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.one(f1);
  await ff.delay(5000);

  ff.start(); // re start

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

