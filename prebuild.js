// Script to pre-compile all pages before building
const fs = require('fs');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '===== Pre-compiling all pages for production =====');

// Define the pages to pre-compile
const pagesToPrecompile = [
  '/sign-detection',
  '/dictionary',
  '/visualize',
  '/maintenance'
];

// Instead of creating a temporary file, we'll just log the pages that will be included
console.log('\x1b[33m%s\x1b[0m', 'Pages that will be pre-compiled:');
pagesToPrecompile.forEach(page => {
  console.log(`  - ${page}`);
});

// Note: Next.js automatically pre-compiles all pages during production build
// This script is mainly informational and to ensure we don't forget any pages

console.log('\x1b[32m%s\x1b[0m', 'Pre-compilation preparation complete. All pages will be included in the build.');

