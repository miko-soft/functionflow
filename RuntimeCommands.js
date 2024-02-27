const readline = require('readline');
const path = require('path');
const fs = require('fs');



class RuntimeCommands {

  constructor() {
    this.flag;
  }



  /**
   * Listen for the runtime commands
   */
  listen() {

    // readline
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on('line', async (line) => {
      line = line.replace(/\s+/g, ' ').trim();

      if (line === '') {
        // console.log('');
      } else if (line === 'p') {
        console.log(':paused\n');
        this._pause();
      } else if (line === 'r') {
        console.log(':resumed\n');
        this._resume();
      } else if (line === 's') {
        console.log(':stoped\n');
        this._stop();
      } else if (line === 'k') {
        console.log(':killed\n');
        this._kill();


      } else if (line === 'i') {
        this._showInput();

      } else if (/input.*\.json/i.test(line)) {
        console.log(':input loaded\n');
        this._loadInput(line);

      } else if (/^input.*\=/.test(line)) {
        console.log(':set input field');
        this._setInputProperty(line);


      } else if (line === 'x') {
        console.log(':show x');
        this._showX();

      } else if (/^x.*\=/.test(line)) {
        console.log(':set x field');
        this._setXProperty(line);

      } else if (/^delete x.*/.test(line)) {
        console.log(':delete x field');
        this._deleteXfield(line);


      } else if (line === 'e') {
        // evaluate some js code
        console.log(':eval');
        rl.prompt(); // show > prompt
        this.flag = 'eval';
      } else if (this.flag === 'eval') {
        this._evaluate(line); // > console.log('my test');
        this.flag = undefined; // reset flag

      } else if (line === 'f') {
        // write some function and execute it
        console.log(':func');
        rl.prompt(); // show > prompt
        this.flag = 'func';
      } else if (this.flag === 'func') {
        this._exeFunction(line); // > console.log(lib);
        this.flag = undefined; // reset flag


      } else if (/.js/i.test(line)) {
        // execute functions serially
        console.log(`:serial function(s) execution`);
        if (this.status === 'start') { console.log(' The skript is not paused.'); return; }
        this.runtimeTest = true;
        await this._exeSerial(line); // line: 'openLoginPage, login'
        this.runtimeTest = false;
      }

    });
  }




  /************ PRIVATES *********/
  /**
   * Pause Functionflow functions.
   * Notice: currently running function will finish completely and next function will be paused.
   */
  _pause() {
    try {
      this.pause();
    } catch (err) {
      console.log(err.message);
    }
  }

  /**
   * Resume paused Functionflow function.
   */
  _resume() {
    try {
      this.start();
    } catch (err) {
      console.log(err.message);
    }
  }

  /**
   * Stop Functionflow function.
   */
  _stop() {
    try {
      this.stop();
    } catch (err) {
      console.log(err.message);
    }
  }

  /**
   * Kill the NodeJS process.
   */
  _kill() {
    process.exit(1);
  }



  /**
   * Show the input JSON file. Input must be injected into the ff.lib -> ff.LibAdd({input});
   */
  _showInput() {
    try {
      console.log(this.lib.input);
    } catch (err) {
      console.log(err.message);
    }
  }


  /**
   * Reload the input JSON file. Input must be injected into the ff.lib -> ff.LibAdd({input});
   * @param {String} inputFile - myInput2.json
   */
  _loadInput(inputFile) {
    try {
      const inputFile_path = path.join(process.cwd(), inputFile);
      const inputJson = fs.readFileSync(inputFile_path, 'utf-8');
      this.lib.input = JSON.parse(inputJson);
      console.log(this.lib.input);
    } catch (err) {
      console.log(err.message);
    }
  }


  /**
   * Setup "input.field" value.
   * For example: input.messages = { id: '12345'};
   */
  _setInputProperty(line) {
    try {
      line = 'this.lib.' + line; // this.lib.input.messages = { id: '12345'}
      let func = new Function(line);
      func = func.bind(this);
      func();
      console.log(`new input value:: ${JSON.stringify(this.lib.input, null, 2)}`);
    } catch (err) {
      console.log(err.message);
    }
  }



  /**
   * Show the "x" a transitional variable.
   */
  _showX() {
    try {
      console.log(this.x);
    } catch (err) {
      console.log(err.message);
    }
  }


  /**
   * Setup "x.field" value.
   * For example: x.product.name = ' Red car ' or x.product.name = " Red car"
   */
  _setXProperty(line) {
    if (!/^this\./.test(line)) { line = 'this.' + line + ';'; }
    try {
      let func = new Function(line);
      func = func.bind(this);
      func();
      console.log(`new x value:: ${line}`);
    } catch (err) {
      console.log(err.message + `in: "${line}"`);
    }
  }



  /**
   * Delete "x.field" value.
   * For example: delete x.product.name
  */
  _deleteXfield(line) {
    let xField = line.replace('delete', '').trim(); // x.product.name
    if (!/^this\./.test(xField)) { xField = 'this.' + xField; }
    try {
      let func = new Function(`delete ${xField};`);
      func = func.bind(this);
      func();
      console.log(`deleted x field:: ${xField}`);
    } catch (err) {
      console.log(err.message + `in: "${xField}"`);
    }
  }


  /**
   * Convert string into integer, float or boolean.
   * @param {string} value
   * @returns {string | number | boolean | object}
   */
  _typeConvertor(value) {
    // JSON string - {"a": 3, "b":"B"}
    function isJSON(str) {
      try { JSON.parse(str); }
      catch (err) { return false; }
      return true;
    }

    // JS object notation string - JSON string - {a: 3, b:'B'}
    function hasObjectNotation(value) {
      return /^\{.+\}$/.test(value);
    }

    if (!!value && !isNaN(value) && !/\./.test(value)) { // convert string into integer (12)
      value = parseInt(value, 10);
    } else if (!!value && !isNaN(value) && /\./.test(value)) { // convert string into float (12.35)
      value = parseFloat(value);
    } else if (value === 'true' || value === 'false') { // convert string into boolean (true)
      value = JSON.parse(value);
    } else if (isJSON(value)) {
      value = JSON.parse(value);
    } else if (hasObjectNotation(value)) {
      console.log(JSON.stringify(value));
      value = eval(`(${value})`);
    } else if (value === 'undefined') {
      value = undefined;
    } else if (value === 'null') {
      value = null;
    }

    return value;
  }



  /**
    * Execute functions serially. Stop the skript before using this command (s).
    * @param {String} files - 'login.js, extractData.js'
    */
  async _exeSerial(files) {
    const files_arr = files.split(',');

    try {

      const funcs = [];

      for (let f of files_arr) {

        f = f.trim();
        let file_path = path.join(process.cwd(), f);
        if (!/\.js/.test(f)) { file_path += '.js'; } // add .js extension

        const tf = this._checkFileExists(file_path); // check if file exists

        let func;
        if (tf) {
          const funcString = fs.readFileSync(file_path, 'utf-8');
          // console.log(funcString);
          eval(funcString);
          func = module.exports;
          funcs.push(func);
        } else {
          throw new Error(`Function NOT FOUND: ${file_path}`);
        }

      }

      await this.serial(funcs);

    } catch (err) {
      console.log(err.message);
    }
  }



  /**
   * Evaluate JS code. Simmilar to $node command.
   * @param {String} code - JS code
   */
  _evaluate(code) {
    try {
      eval(code);
    } catch (err) {
      console.log(err.message);
    }
  }



  /**
   * Execute FunctionFlow function code with x, lib parameters.
   * @param {String} ff_code - JS code for functionflow function (x, lib) => { ...ff_code... }
   */
  async _exeFunction(ff_code) {
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
      const func = new AsyncFunction('x', 'lib', ff_code);
      await this.one(func);
    } catch (err) {
      console.log(err.message);
    }
  }


  /**
   * Check if the file exists.
   * @param {string} file_path - dir/file.js
   * @returns {boolean}
   */
  _checkFileExists(file_path) {
    try {
      fs.accessSync(file_path, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }




}


module.exports = RuntimeCommands;
