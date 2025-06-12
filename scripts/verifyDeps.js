const fs = require('fs');
const path = require('path');

function check(file) {
  if (!fs.existsSync(path.join('node_modules', '.bin', file))) {
    console.error(`${file} not found in node_modules`);
    process.exit(1);
  }
}

if (!fs.existsSync('node_modules')) {
  console.error('node_modules directory missing');
  process.exit(1);
}

check('eslint');
console.log('Dependencies verified.');

