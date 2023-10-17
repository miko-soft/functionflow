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


// CONTROLS via event emiter
const eventEmitter = new EventEmitter();

setTimeout(() => {
  eventEmitter.emit('ff-pause');
}, 2000);

setTimeout(() => {
  eventEmitter.emit('ff-start');
}, 5000);

setTimeout(() => {
  eventEmitter.emit('ff-stop');
}, 8000);



const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 1000 }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.serial([f1, f2, f3, f1, f2, f3, f1, f2, f3]);
  await ff.repeat(10);

  return ff.x;
};



const inp = 5;
main(inp, eventEmitter)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));

