// Pre-transpile every src/*.jsx into dist/*.js so the browser never has to
// run @babel/standalone (which costs ~1 MB download and ~3 s of main-thread
// parsing on slow devices). Each file is wrapped in an IIFE to preserve the
// per-script scope isolation that Babel-standalone gave us at runtime —
// without that wrap, top-level `const useCallback` in two files collides at
// the shared classic-script lexical record level.
//
// The output files load in the same order as before via 12 <script src=…>
// tags in index.html. Globals each file publishes (window.Icons, window.Calcs,
// etc.) are picked up by later files via plain global lookup.
//
// Run: `npm run build`        — single pass
//      `npm run dev`          — rebuild on .jsx change
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'dist');
const watch = process.argv.includes('--watch');

fs.mkdirSync(OUT, { recursive: true });

async function buildFile(file) {
  const code = fs.readFileSync(path.join(SRC, file), 'utf8');
  const result = await esbuild.transform(code, {
    loader: 'jsx',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    minify: true,
    target: 'es2020',
    sourcemap: false,
  });
  // IIFE wrapper isolates each file's top-level let/const so multiple .js
  // scripts in one page can each declare e.g. `const useCallback = …`
  // without colliding. Window assignments inside still escape to the global.
  const wrapped = `(function(){"use strict";${result.code}})();`;
  const outPath = path.join(OUT, file.replace(/\.jsx$/, '.js'));
  fs.writeFileSync(outPath, wrapped);
  return { file, bytes: wrapped.length };
}

async function buildAll() {
  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.jsx'));
  const results = await Promise.all(files.map(buildFile));
  const total = results.reduce((s, r) => s + r.bytes, 0);
  console.log(`built ${files.length} files → dist/  (${(total / 1024).toFixed(1)} KB total)`);
}

(async () => {
  try {
    await buildAll();
  } catch (e) {
    console.error('build error:', e.message);
    process.exit(1);
  }
  if (watch) {
    fs.watch(SRC, async (event, file) => {
      if (file && file.endsWith('.jsx')) {
        try {
          const r = await buildFile(file);
          console.log(`rebuilt ${file} (${(r.bytes / 1024).toFixed(1)} KB)`);
        } catch (e) {
          console.error(`build error in ${file}:`, e.message);
        }
      }
    });
    console.log('watching src/ for changes... (Ctrl-C to stop)');
    process.stdin.resume();
  }
})();
