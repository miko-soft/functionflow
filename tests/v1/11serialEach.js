const { EventEmitter } = require('events');
const FunctionFlow = require('../../index.js');

// functions
const f1 = (x, lib) => {
  x++;
  console.log('f1::', x);
  console.log('lib.serialEachElement::', lib.serialEachElement);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2::', x);
  console.log('lib.serialEachElement::', lib.serialEachElement);
  return x;
};

const f3 = (x, lib) => {
  x++;
  console.log('f3::', x);
  console.log('lib.serialEachElement::', lib.serialEachElement);
  return x;
};






const main = async (input, eventEmitter) => {
  const ff = new FunctionFlow({ debug: true, msDelay: 800 }, eventEmitter);

  const x = input;
  const lib = { eventEmitter, ff };
  ff.xInject(x);
  ff.libInject(lib);

  const arr = ['Joe', 'Ann', 'Mary'];
  await ff.serialEach([f1, f2, f3, f1], arr);
  await ff.delay(3400);

  console.log(ff.lib); // serialEachElement & serialEachKey should be deleted

  return ff.x;
};



const inp = 5;
const eventEmitter = new EventEmitter();
main(inp, eventEmitter)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));
