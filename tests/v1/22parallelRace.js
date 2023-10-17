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

  // parallelRace will send output of f3 because it's the fastest function
  await ff.parallelRace([f1, f2, f3]);

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));
