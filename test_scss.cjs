const fs = require('fs');
const sass = require('sass');

// Test each SCSS file individually
const filesToTest = [
  './quartz/styles/custom.scss',
  './quartz/components/styles/semanticLinks.scss',
  './quartz/styles/base.scss',
  './quartz/styles/variables.scss',
  './quartz/styles/themes/_index.scss'
];

console.log('Testing individual SCSS files for compilation errors...\n');

for (const file of filesToTest) {
  try {
    if (fs.existsSync(file)) {
      console.log(`Testing ${file}...`);
      const result = sass.compile(file);
      console.log(`✓ ${file} - OK`);
      
      // Check for any standalone $ in the output
      const lines = result.css.split('\n');
      let foundIssue = false;
      lines.forEach((line, i) => {
        // Look for $ that's not part of a CSS selector or comment
        if (line.includes('$') && !line.match(/\[.*\$.*\]/) && !line.match(/^\s*\/\*/)) {
          console.log(`  ⚠️  Suspicious line ${i+1}: ${line.trim()}`);
          foundIssue = true;
        }
      });
      
      if (!foundIssue) {
        console.log(`✓ No suspicious $ tokens found in ${file}`);
      }
    } else {
      console.log(`✗ ${file} - File not found`);
    }
  } catch (error) {
    console.log(`✗ ${file} - Error: ${error.message}`);
  }
  console.log('');
}