const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return new Promise(resolve => setTimeout(() => { resolve(x + 2); }, 1000));
};

const f2 = (x, lib) => {
  console.log('f2', x);
  return new Promise(resolve => setTimeout(() => { resolve(x * 3); }, 3000));
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

  // parallelAll will send output after 3 seconds because fja2 will need the longest time interval to be fulfilled (3 seconds)
  await ff.parallelAll([f1, f2, f3]);

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));
