const fs = require('fs');
const path = require('path');
const sass = require('sass');
const { Features, transform } = require('lightningcss');

// Read the CSS files exactly as the build process does
console.log('Testing build process CSS generation...\n');

try {
  // Read the main styles
  const customResult = sass.compile('./quartz/styles/custom.scss');
  console.log('✓ Custom CSS compiled successfully');
  
  // Read the popover styles
  const popoverResult = sass.compile('./quartz/components/styles/popover.scss');
  console.log('✓ Popover CSS compiled successfully');
  
  // Read the semantic links styles
  const semanticResult = sass.compile('./quartz/components/styles/semanticLinks.scss');
  console.log('✓ Semantic links CSS compiled successfully');
  
  // Join the styles as the build process would
  const joinedCSS = [
    customResult.css,
    popoverResult.css,
    semanticResult.css
  ].join('\n\n');
  
  console.log('✓ CSS joined successfully');
  console.log('CSS length:', joinedCSS.length);
  
  // Write the joined CSS for inspection
  fs.writeFileSync('./debug_joined_css.css', joinedCSS);
  console.log('✓ Joined CSS written to debug_joined_css.css');
  
  // Now test the transformation
  console.log('\nTesting lightningcss transform...');
  
  const transformed = transform({
    filename: "test-build.css",
    code: Buffer.from(joinedCSS),
    minify: true,
    targets: {
      safari: (15 << 16) | (6 << 8), // 15.6
      ios_saf: (15 << 16) | (6 << 8), // 15.6
      edge: 115 << 16,
      firefox: 102 << 16,
      chrome: 109 << 16,
    },
    include: Features.MediaQueries,
  });
  
  console.log('✓ Transform successful');
  console.log('✓ Build process CSS generation completed without errors');
  
} catch (error) {
  console.log('✗ Error:', error.message);
  console.log('Stack:', error.stack);
  
  // Check if the error is related to a specific character
  if (error.message.includes('Unexpected token')) {
    console.log('\nChecking for problematic characters in CSS...');
    
    // Read the joined CSS if it exists
    if (fs.existsSync('./debug_joined_css.css')) {
      const css = fs.readFileSync('./debug_joined_css.css', 'utf8');
      const lines = css.split('\n');
      
      lines.forEach((line, i) => {
        if (line.includes('$') && !line.match(/\/\*/)) {
          console.log(`Line ${i+1}: ${line}`);
        }
      });
    }
  }
}