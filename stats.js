'use strict';

const output = require('./code-output.json');

const total = output.length;

function hasVulnerability(results) {
  return results.filter((result) => result.startsWith('VULNERABLE')).length > 0;
}

function hasFault(results) {
  return results.filter((result) => result.startsWith('SIGNAL')).length > 0;
}

const errors = output.filter((contract) => contract.result.includes('ERROR')).length;
const notImplemented = output.filter((contract) => contract.result.includes('NOT_IMPLEMENTED')).length;
const vulnerable = output.filter((contract) => hasVulnerability(contract.result)).length;
const timedOut = output.filter((contract) => contract.result.includes('KILLED SIGTERM')).length;
const faults = output.filter((contract) => hasFault(contract.result)).length;
const unknown = output.filter((contract) => contract.result.includes('UNKNOWN')).length;

console.log(total);

function log(name, number) {
  console.log(name, number, number / total * 100);
}

log('errors', errors);
log('unimplemented instruction', notImplemented);
log('vulnerable', vulnerable);
log('timed out', timedOut);
log('segfault', faults);
log('unknown error', unknown);
