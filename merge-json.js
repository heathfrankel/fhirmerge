// merge-json.js
const fs = require('fs');
const path = require('path');

// A deep merge function to combine objects recursively.
function deepMerge(target, source) {
  const output = { ...target
  };

  if (target && typeof target === 'object' && source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

// Get command-line arguments.
const args = process.argv.slice(2);
const sourceFile = args[0];
const targetFile = args[1];

if (!sourceFile || !targetFile) {
  console.error('Usage: node merge-json.js <source_file.json> <target_file.json>');
  process.exit(1);
}

try {
  // Read and parse the JSON files.
  const sourceData = JSON.parse(fs.readFileSync(path.resolve(sourceFile), 'utf8'));
  const targetData = JSON.parse(fs.readFileSync(path.resolve(targetFile), 'utf8'));

  // Perform the deep merge.
  const mergedData = deepMerge(targetData, sourceData);

  // Output the merged JSON to stdout.
  console.log(JSON.stringify(mergedData, null, 2));

} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}