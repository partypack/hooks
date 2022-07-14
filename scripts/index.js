const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const run = (command) => execSync(command, { stdio: 'inherit', cwd: root });
const silent = (command) => execSync(command, { cwd: root });

module.exports = {
  root,
  run,
  silent,
};
