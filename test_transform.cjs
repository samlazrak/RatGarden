const fs = require('fs');
const sass = require('sass');
const { Features, transform } = require('lightningcss');

console.log('Testing lightningcss transform...\n');

try {
  // First, compile the SCSS
  const result = sass.compile('./quartz/styles/custom.scss');
  console.log('✓ SCSS compilation successful');
  
  // Now test the lightningcss transform
  const stylesheet = result.css;
  console.log('Testing lightningcss transform...');
  
  const transformed = transform({
    filename: "test.css",
    code: Buffer.from(stylesheet),
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
  
  console.log('✓ lightningcss transform successful');
  console.log('✓ CSS minification completed without errors');
  
} catch (error) {
  console.log('✗ Transform failed:', error.message);
  console.log('Stack:', error.stack);
}