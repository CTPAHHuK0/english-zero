// Builds single-file versions of the app (no server needed):
//   dist/english-zero.html — complete page: open it in any browser or send it to a phone
//   dist/artifact.html     — the same page without <html>/<head>/<body> wrappers, for claude.ai Artifacts
// Usage: node tools/build.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
let html = read('index.html');

html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, p) => '<style>\n' + read(p) + '\n</style>');
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, p) => {
  const js = read(p);
  if (/<\/script/i.test(js)) throw new Error(p + ' contains </script');
  return '<script>\n' + js + '\n</script>';
});

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

// Full standalone page: files next to index.html (manifest, icons) are not available, so drop those links
const standalone = html
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="(icon|apple-touch-icon)"[^>]*>\n?/g, '');
fs.writeFileSync(path.join(root, 'dist', 'english-zero.html'), standalone);

// Artifact page: the host adds doctype, charset and viewport itself
const artifact = standalone
  .replace(/<!doctype html>\n?/i, '')
  .replace(/<html[^>]*>\n?/, '')
  .replace(/<\/html>\n?/, '')
  .replace(/<head>\n?/, '')
  .replace(/<\/head>\n?/, '')
  .replace(/<body>\n?/, '')
  .replace(/<\/body>\n?/, '')
  .replace(/<meta charset="utf-8">\n?/, '')
  .replace(/<meta name="viewport"[^>]*>\n?/, '');
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), artifact);

const kb = f => (fs.statSync(path.join(root, 'dist', f)).size / 1024).toFixed(0) + ' KB';
console.log('dist/english-zero.html', kb('english-zero.html'));
console.log('dist/artifact.html', kb('artifact.html'));
