const fs = require('fs');
const path = require('path');

// Let's examine what components are being loaded and their CSS
console.log('Examining component CSS files...\n');

// Check all component styles
const stylesDir = './quartz/components/styles';
const files = fs.readdirSync(stylesDir).filter(f => f.endsWith('.scss'));

for (const file of files) {
  const filePath = path.join(stylesDir, file);
  console.log(`\n=== ${file} ===`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for any standalone $ characters that might cause issues
    const lines = content.split('\n');
    let foundSuspicious = false;
    
    lines.forEach((line, i) => {
      // Look for problematic patterns
      if (line.includes('$') && !line.match(/\$[a-zA-Z_-]/) && !line.match(/\[.*\$.*\]/) && !line.match(/^\s*\/\*/)) {
        console.log(`  ⚠️  Line ${i+1}: ${line.trim()}`);
        foundSuspicious = true;
      }
    });
    
    if (!foundSuspicious) {
      console.log(`  ✓ No suspicious patterns found`);
    }
    
  } catch (error) {
    console.log(`  ✗ Error reading file: ${error.message}`);
  }
}

// Also check for any malformed imports or syntax
console.log('\n\nChecking for import issues...\n');

// Check if any file has invalid CSS syntax that might cause issues
const sass = require('sass');

for (const file of files) {
  const filePath = path.join(stylesDir, file);
  console.log(`Testing ${file}...`);
  
  try {
    const result = sass.compile(filePath);
    console.log(`  ✓ Compilation successful`);
  } catch (error) {
    console.log(`  ✗ Compilation failed: ${error.message}`);
  }
}