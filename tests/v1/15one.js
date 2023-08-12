const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f1 = (x, lib) => {
  x++;
  console.log('f1-return', x);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2-return', x);
  return x;
};

const f3 = (x, lib) => {
  x++;
  console.log('f3-return', x);
  console.log(lib);
  return x;
};



const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 800 }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.one(f3);

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));
