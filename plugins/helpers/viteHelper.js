const fs = require('fs');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';
const viteDevServerUrl = `http://localhost:${process.env.VITE_PORT || 3000}`;
const manifestPath = path.resolve(__dirname, '../../../public/js/manifest.json');

function vite(asset) {
  console.log(`Vite Helper Called: ${asset}`);
  if (isDevelopment) {
    console.log(`Development Mode: ${viteDevServerUrl}/${asset}`);
    return `${viteDevServerUrl}/${asset}`;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`Production Mode: /js/${manifest[asset].file}`);
  return `/js/${manifest[asset].file}`;
}

module.exports = { vite };
