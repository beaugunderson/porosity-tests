const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const stripColors = require('strip-ansi');

const contracts = require('./code.json');

const env = {
  timeout: 1000
};

async function decompile(code) {
  try {
    const {stdout, stderr} = await exec(`porosity --code ${code} --decompile`, env);

    return stdout;
  } catch(e) {
    if (e.killed) {
      return `KILLED ${e.signal}`;
    } else if (e.signal) {
      return `SIGNAL ${e.signal}`;
    } else {
      return 'UNKNOWN';
    }
  }
}

const RE_VULNERABLE = /^L\d+ \([A-Z0-9]+\):/;
const output = [];

async function run() {
  for (let contract of contracts) {
    const stdout = await decompile(contract.code);

    let stripped = stripColors(stdout)
    let lines = stripped.split(/\n/g);
    let result = [];

    for (let line of lines) {
      if (RE_VULNERABLE.test(line)) {
        result.push(`VULNERABLE ${line}`);
      }
    }

    if (stdout.includes('ERROR')) {
      result.push('ERROR');
    }

    if (stdout.includes('NOT_IMPLEMENTED')) {
      result.push('NOT_IMPLEMENTED');
    }

    if (stdout.includes('SIGNAL')) {
      result.push(stdout);
    }

    if (stdout.includes('KILLED')) {
      result.push(stdout);
    }

    if (stdout === 'UNKNOWN') {
      result.push('UNKNOWN');
    }

    console.log(contract.address);
    console.log(result);

    contract.result = result;
    contract.stdout = stripped;

    output.push(contract);
  }

  fs.writeFileSync('./code-output.json', JSON.stringify(output, null, 2), 'utf-8');
}

try {
  run();
} catch(e) {
  console.log(e);
}
