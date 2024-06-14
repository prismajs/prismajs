const path = require('path');
const fs = require('fs');

const webpack = (filename) => {
  const manifestPath = path.join(__dirname, '../../public/js/manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return manifest[filename] ? `/js/${manifest[filename]}` : `/js/${filename}`;
  }
  return `/js/${filename}`;
};

module.exports = { webpack };
