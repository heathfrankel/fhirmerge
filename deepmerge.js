// deepmerge.js
const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');

// This custom function tells deepmerge to replace the entire array in the target
// with the array from the source, rather than concatenating them.
const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

const args = process.argv.slice(2);
const sourceFile = args[0];
const targetFile = args[1];

if (!sourceFile || !targetFile) {
  console.error('Usage: node deepmerge.js <source_file.json> <target_file.json>');
  process.exit(1);
}

try {
  const sourceData = JSON.parse(fs.readFileSync(path.resolve(sourceFile), 'utf8'));
  const targetData = JSON.parse(fs.readFileSync(path.resolve(targetFile), 'utf8'));

  const mergedData = deepmerge(targetData, sourceData, {
    arrayMerge: overwriteMerge
  });

  console.log(JSON.stringify(mergedData, null, 2));

} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}