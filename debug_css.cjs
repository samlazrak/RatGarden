const fs = require('fs');
const sass = require('sass');

// Compile the main SCSS file and save it to see the output
try {
  const result = sass.compile('./quartz/styles/custom.scss');
  fs.writeFileSync('./debug_output.css', result.css);
  console.log('CSS written to debug_output.css');
  
  // Check for any standalone dollar characters (not part of valid selectors)
  const lines = result.css.split('\n');
  lines.forEach((line, i) => {
    // Look for dollar sign that's not part of a valid CSS selector
    if (line.includes('$') && !line.match(/\[.*\$.*\]/)) {
      console.log(`Suspicious line ${i+1}: ${line}`);
    }
  });
} catch (error) {
  console.error('SCSS compilation failed:', error.message);
}