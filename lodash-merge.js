// lodash-merge.js
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const args = process.argv.slice(2);
const sourceFile = args[0];
const targetFile = args[1];

if (!sourceFile || !targetFile) {
  console.error('Usage: node lodash-merge.js <source_file.json> <target_file.json>');
  process.exit(1);
}

try {
  const sourceData = JSON.parse(fs.readFileSync(path.resolve(sourceFile), 'utf8'));
  const targetData = JSON.parse(fs.readFileSync(path.resolve(targetFile), 'utf8'));

  const mergedData = _.merge(targetData, sourceData);

  console.log(JSON.stringify(mergedData, null, 2));

} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}