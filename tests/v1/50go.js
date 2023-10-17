const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f0 = (x, lib) => {
  x++;
  console.log('f0:: ', x);
  return x;
};

const f1 = (x, lib) => {
  x++;
  console.log('f1:: ', x);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2:: ', x);
  if (x < 13) { lib.ff.go(1); } // go back to f1
  return x;
};

const f3 = (x, lib) => {
  x++;
  console.log('f3:: ', x);
  return x;
};

const f4 = (x, lib) => {
  x++;
  console.log('f4:: ', x);
  lib.ff.go(6); // go to f6 e.g. jump over f5
  return x;
};

const f5 = (x, lib) => {
  x++;
  console.log('f5:: ', x);
  return x;
};

const f6 = (x, lib) => {
  x++;
  console.log('f6:: ', x);
  return x;
};



const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 1000 }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.serial([f0, f1, f2, f3, f4, f5, f6]);

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));
