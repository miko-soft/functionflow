# @mikosoft/functionflow
> Control the execution flow of the javascript functions.

- methods that execute JavaScript functions in serial or parallel order
- repeat multiple serial/parallel bundled functions
- start, stop, pause the function execution
- no npm dependencies

The **FunctionFlow** controls whether functions will be executed in serial or in parallel sequence. It gives the possibility for iterative repetition of serial or parallel function sequence. It defines time delays between every function execution step. Finally, it controls the whole process to start, stop or pause.


## Installation
```bash
$ npm install --save @mikosoft/functionflow
```


## Example
```js
/*** NodeJS script ***/
const { EventEmitter } = require('events');
const FunctionFlow = require('@mikosoft/functionflow');


// functions
const f1 = (x, lib) => {
  const input = lib.input;
  console.log('f1::', x); // 5
  console.log('input.name::', input.name); // John Doe
  x++;
  return x;
};

const f2 = (x, lib) => {
  console.log('f2::', x); // 6
  x++;
  return x;
};

const f3 = function (x, lib) {
  console.log('f3::', x); // 7
  console.log('this::', this); // {}
  console.log('lib::', lib); // {input,ff}
  x++;
  return x;
};


// main
const main = async (input, library) => {
  const eventEmitter = library.eventEmitter || new EventEmitter();
  const ff = new FunctionFlow({ debug: true, msDelay: 800 }, eventEmitter);

  const x = 5;
  const lib = { input, ff };
  ff.xInject(x);
  ff.libInject(lib);

  const output = await ff.serial([f1, f2, f3, f1]); // output: 8
  await ff.delay(3400);

  return output;
};


// execute main
const input = { name: 'John Doe' };
main(input)
  .then(output => console.log('OUTPUT:: ', output))
  .catch(err => console.error('ERROR:: ', err));
```

Other examples are in /tests/ folder.



## API

#### constructor(opts:{debug:boolean, msDelay:number}, eventEmitter:EventEmitter)
- debug - show debug message
- msDelay - delay between functions
- eventEmitter - NodeJS event emitter object (connects with outer code)


#### xInject(x:any) :void
Inject x (transitional variable) in function first parameter - func(x, lib).

#### libInject(lib:object) :void
Inject libraries like Cheerio, Puppeteer, ...etc. in function second parameter - func(x, lib).

#### libAdd(lib:object) :void
Add libraries to libraries already injected by libInject().

#### libRemove() :void
Remove all libraries.

#### libList() :array
List all libraries.


### /*=========== FUNCTION  BUNDLERS ==============*/

#### async serial(funcs:function[]) :any
Execute funcs functions one by one.
```
input------>|--f0-->|msDelay|--f3-->|msDelay|--f2-->|msDelay|------>output
```

#### async serialEach(funcs:function[], arr:array) :any
Execute funcs functions one by one and repeat it for every array element.
The funcs chain is repeated the arr.length times. The "arr" element is stored in the "lib.serialEachElement" and can be used inside the function.
```
input------>|--f0-->|msDelay|--f3-->|msDelay|--f2-->|msDelay|------>output
            |                                            arr|
            |<--------------repeat arr.length --------------|
```

#### async serialRepeat(funcs:function[], n:number) :any
Execute funcs functions one by one and repeat it n times.
The funcs chain is repeated the n times. The iteration number is stored in the "lib.serialRepeatIteration" and can be used in the function.
```
input------>|--f0-->|msDelay|--f3-->|msDelay|--f2-->|msDelay|------>output
            |                                              n|
            |<-------------------repeat n ------------------|
```

#### async one(func:function) :any
Execute just one function.

#### async parallelAll(funcs:function[]) :any
Take any defined function and execute simultaneously. All defined functions must return fulfilled promises. Input is same for all functions. Returned value is an array of resolved values.
```
         --> |--------- f2(x) ---------->---|
-- input --> |--------- f4(x) ------->------|msDelay|---> [r2, r4, r8]
         --> |--------- f8(x) ------------->|
```

#### async parallelRace(funcs:function[]) :any
Run functions in paralell. Fastest function must return fulfilled promise. Returned value is value from first resolved (fastest) function.
```
         --> |--------- f2(x) --------|-->
-- input --> |--------- f4(x) ------->|msDelay|---> r4
         --> |--------- f8(x) --------|----->
```


### /*=========== ITERATION  METHODS ==============*/
#### async repeat(n:number) :any
Repeat last executed FunctionFlow bundle method (serial, serialEach, ...) n times.



### /*=========== COMMANDS ==============*/
#### stop() :void
Stops the execution of all functions used in bundle methods (serial, one or parallel). Condition: status = 'start'.
```
ff.stop(); // inside function
eventEmitter.emit('ff-stop'); // out of function
```

#### start() :void
Starts/restarts function flow execution if it's previously been stopped or paused. Condition: status = 'pause' | 'stop'.
```
ff.start(); // inside function
eventEmitter.emit('ff-start'); // out of function
```

#### pause() :void
Pauses function flow execution used in bundle methods (serial, one or parallel). Condition: status = 'start'.
```
ff.pause(); // inside function
eventEmitter.emit('ff-pause'); // out of function
```


#### go(goTo:number) :void
Go to the function used in the serial(funcs) method. Parameter goTo is the index number of funcs array and the condition 0 <= goTo < funcs.length must be fulfilled. When the execution of that function is finished, continue with the next function in funcs array.
It's usually used to go to another function which is in the serial() method.
```
f2.js
------------------
module.exports = (x, lib) => {
  x++;
  lib.echo.log('f2:: ', x);
  if (x < 13 ) { lib.ff.go(1); } // go back to f1
  return x;
};
```

#### next() :void
Stop execution of all funcs functions in serial(funcs) method and continue with the next serial, one or parallel bundle method.
It will work only inside a function used in the serial() method. A parameter is not needed for this method.
```
f2.js
------------------
module.exports = (x, lib) => {
  x++;
  lib.echo.log('f2::', x);
  lib.ff.next();
  return x;
};
```

#### jump(jumpTo:number) :void
Jump to iteration number defined in the repeat(n) method. When that iteration is executed continue with the next iteration in repeat(n) method. The current iteration will finish with all its functions.
Parameter jumpTo is the iteration number and the condition 0 < jumpTo <= n must be fulfilled.
It's usually used to skip some iterations under certain conditions. To get a current iteration number use ff.iteration.
```
f2.js
------------------
module.exports = (x, lib) => {
  x++;
  lib.echo.log('f2::', x);
  if (lib.ff.iteration === 2) { lib.ff.jump(10); } // on 2nd iteration jump to last iteration
  return x;
};
```

#### break() :void
Breaks all iterations in repeat(n) method. Parameter is not required. The current iteration will finish with all its functions.
It sets this.jumpTo = Infinity. It's used inside the function to stop all repeats (iterations).
```
ffunc.js
------------------
module.exports = (x, lib) => {
  x++;
  if (x.val > 2) { lib.ff.break(); } // stop iterations defined in main.js by ff.repeat(n);
  return x;
};
```


### /*=========== DELAYS ==============*/
#### delay(ms:number) :void
Delay in miliseconds.
```
await ff.delay(3400); // delay of 3.4 seconds
```

#### delayRnd(msMin:number, msMax:number) :void
Random delay from msMin to msMax.
```
await ff.delayRnd(3000, 8000); // delay between 3 and 8 seconds
```



### /*=========== RUNTIME COMMANDS ==============*/
It enables real-time control over functions execution, allowing it to be paused, resumed, or stopped, as well as facilitating isolated function testing, ultimately conserving significant developer time.

#### p
Use this command to pause already started task.
Notice: This command will not pause currently running function. That function will be executed till the end and the next function will be paused.
For example if we have **ff.serial([f1, f2, f3])** and **p** command is executed during f2 runtime, then f2 will finish but f3 will not start.

#### r
Resume the paused task. Usually it's used after command **p** when the paused task should be started again.

#### s
Stop the running task. When this command is used, the current function will be executed to completion, and all subsequent functions will not be executed.

#### k
Kill the running NodeJS process and exit to the terminal command prompt. It's simmilar to CTRL+C.

#### i
Show the input which is currently in use **this.lib.input**.

#### input.json
When the command contains **"input"** and **".json"** or **.js** at the end it will reload the input file.
For example *myInput5.json* will load new input data and the task will continue to work with that data. It's useful when we want to see how different inputs will reflect to the function execution.

**Important:** Add input into the *lib* parameter with *ff.libAdd({input});*.


#### input.field = value
Set the input property.

#### x
Show the "x" (transitional variable) value.

#### x.field = value
Set the x property.

#### delete x.field
Delete the x field (property).


#### e
Evaluate some Javascript code.
It's simmilar to command **$ node** and it's useful when developer needs to test some JS code snippet quickly.

#### f
Test the FunctionFlow function code "ff_code" which has two parameters "x" and "lib" **(x, lib) => { ...ff_code... }**.

#### f1 [,f2, ...]
If the command doesn't correspond to any of the previous commands then it will search for the function file to execute it.
For example if the command is **login** it will search for "login.js" and if exists it will execute it.
Also it's possible to define multiple functions to be executed serially <i>ff.serial[f1, f2, f3]</i>.




### License
The software licensed under [MIT](LICENSE).
