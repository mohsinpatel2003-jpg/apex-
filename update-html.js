const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace all plain section headers with animated ones
htmlContent = htmlContent.replaceAll(
    '<div class="section-header text-center">',
    '<div class="section-header text-center reveal-slide-up">'
);

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Successfully updated section headers in index.html');
