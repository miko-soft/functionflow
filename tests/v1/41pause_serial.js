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
  const ff = lib.ff;
  console.log('f3', x);
  ff.pause();
  return x + 1;
};



// CONTROLS via event emiter
const eventEmitter = new EventEmitter();

// reSTART
setTimeout(() => {
  eventEmitter.emit('ff-start'); // previously paused with ff.pause() in the function
}, 5000);



const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 2000, rcListener: true }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  await ff.serial([f1, f2, f3, f1, f2, f3, f1, f2, f3]);

  return ff.x;
};



const inp = 5;
main(inp, eventEmitter)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));

