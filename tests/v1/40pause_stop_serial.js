const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');


// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  lib.ff.pause();
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

const f4 = (x, lib) => {
  console.log('f4', x);
  return x + 1;
};

const f5 = (x, lib) => {
  console.log('f5', x);
  return x + 1;
};

const f6 = (x, lib) => {
  console.log('f6', x);
  return x + 1;
};


// CONTROLS via event emiter
const eventEmitter = new EventEmitter();

// PAUSE
// reSTART
setTimeout(() => {
  eventEmitter.emit('ff-start'); // previously paused with ff.pause() in the function
}, 3000);

setTimeout(() => {
  eventEmitter.emit('ff-pause');
}, 5000);

setTimeout(() => {
  eventEmitter.emit('ff-start');
}, 8000);

// STOP
setTimeout(() => {
  eventEmitter.emit('ff-stop');
}, 13000);





const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 2000 }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.serial([f1, f2, f3, f4, f5, f6]);

  return ff.x;
};



const inp = 5;
main(inp, eventEmitter)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

