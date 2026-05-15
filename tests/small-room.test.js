// Smoke-test: very small inputs in every calc. Flag outputs that look
// disproportionate (e.g. "1 bucket for 5 sq ft" or "8 bags for tiny slab").
global.React = { useState: () => [null, () => {}], useEffect: () => {},
  useMemo: (f) => f(), useRef: () => ({ current: null }), useCallback: (f) => f };
const fmt = {
  num: (n, d = 0) => isFinite(n) ? Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '0',
  int: (n) => fmt.num(n, 0), dec: (n, d = 2) => fmt.num(n, d),
};
global.window = { Primitives: { fmt, NumberInput: () => null, PillToggle: () => null, Slider: () => null,
  AnimatedNumber: () => null, useTheme: () => [null, () => {}], useLocalStorage: () => [null, () => {}],
  useCountUp: (v) => v, useToast: () => [() => {}, null] },
  Calcs: {}, Data: {}, Icons: new Proxy({}, { get: () => () => null }) };
global.Icons = global.window.Icons;
const fs = require('fs'), path = require('path');
const babel = require('/tmp/parsechk/node_modules/@babel/core');
for (const f of ['data.jsx','primitives.jsx','calculators.jsx','more-calculators.jsx','extra-calculators.jsx']) {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
  const t = babel.transformSync(code, {
    presets: [[require.resolve('/tmp/parsechk/node_modules/@babel/preset-env'), { targets: { node: 'current' } }]],
    plugins: [[require.resolve('/tmp/parsechk/node_modules/@babel/plugin-transform-react-jsx'), { runtime: 'classic' }]],
  }).code;
  new Function('window', 'React', 'Icons', t)(window, React, Icons);
}

const cases = [
  // [name, slug, state, units, brief expectation]
  ['Wall paint — 6×8 ft closet, 8 ft ceiling, 1 door',
    'wall-paint', { length: 6, width: 8, height: 8, doors: 1, windows: 0, coats: 2, coverage: 350 }, 'imperial',
    'a quart or so'],
  ['Wall paint — 2×2 m bathroom, 2.4 m ceiling',
    'wall-paint', { length: 2, width: 2, height: 2.4, doors: 1, windows: 0, coats: 2, coverage: 8.6 }, 'metric',
    'around 1 L'],
  ['Concrete slab — 2×2 ft × 4″',
    'concrete-slab', { shape: 'rect', length: 2, width: 2, diameter: 4, thickness: 4 }, 'imperial',
    'a couple bags'],
  ['Drywall sheets — 4×4 ft closet',
    'drywall-sheets', { length: 4, width: 4, height: 8, sheetSize: '4x8', ceiling: true, doors: 1, windows: 0 }, 'imperial',
    'a few sheets'],
  ['Drywall finishing — 50 sf patch',
    'drywall-finishing', { area: 50, joints: 'light' }, 'imperial',
    'minimal mud/tape/screws'],
  ['Tile boxes — 5×5 ft backsplash, 10 sf/box',
    'tile-boxes', { length: 5, width: 5, tilePerBox: 10, waste: 10, pattern: 'straight' }, 'imperial',
    '~3 boxes'],
  ['Roof pitch — 6/12', 'roof-pitch', { rise: 6, run: 12 }, 'imperial', '26.6°'],
  ['Board feet — single 2×4×8 board',
    'board-feet', { thickness: 2, width: 4, length: 8, qty: 1 }, 'imperial',
    '5.33 bf'],
  ['Mulch — 4×4 ft bed, 3″',
    'mulch', { shape: 'rect', length: 4, width: 4, diameter: 5, depth: 3 }, 'imperial',
    'small bag count'],
  ['Stair — 30″ rise (deck stair), 7″ target',
    'stair-stringer', { totalRise: 30, riserHeight: 7 }, 'imperial',
    '4 risers'],
  ['Gravel — 4×4 ft path, 4″',
    'gravel', { length: 4, width: 4, depth: 4, gravelType: 'crushed' }, 'imperial',
    'small'],
  ['Sq footage — single 4×4 ft',
    'square-footage', { shapes: [{ id: 1, type: 'rect', length: 4, width: 4 }] }, 'imperial',
    '16 sf'],
  ['Footing/pier — 1 × 8″ tube × 4 ft',
    'footing-pier', { type: 'tube', diameter: 8, length: 2, width: 2, height: 4, qty: 1 }, 'imperial',
    '1-2 bags'],
  ['Grout — 5 sf, 4″ tile, 1/16 joint, thin',
    'grout-thinset', { area: 5, tileSize: 4, jointWidth: 1/16, thickness: 'thin' }, 'imperial',
    'minimal'],
  ['Grout — 100 sf, 12″ tile, 1/8″, standard',
    'grout-thinset', { area: 100, tileSize: 12, jointWidth: 0.125, thickness: 'standard' }, 'imperial',
    '1 grout, 2 thinset'],
  ['Shingles — 20×20 ft footprint, 6/12 pitch, 20 lf ridge, 0 valleys',
    'shingle-bundles', { length: 20, width: 20, pitch: 6, ridgeLf: 20, valleys: 0 }, 'imperial',
    '~15 bundles'],
  ['Deck — 4×4 ft, 5.5″ board, 8 ft stock',
    'deck-boards', { length: 4, width: 4, boardWidth: 5.5, boardLength: 8, orientation: 'length', gap: 0.125 }, 'imperial',
    'small'],
  ['Sod — 10×10 ft small lawn',
    'sod', { length: 10, width: 10, sodType: 'slab' }, 'imperial',
    '1 pallet'],
  ['Trim/ceiling — 8×8 ft, 8 ft ceiling, 4″ trim, 1 door 1 window, 2 coats',
    'trim-ceiling-paint', { length: 8, width: 8, height: 8, trimWidth: 4, doors: 1, windows: 1, coats: 2 }, 'imperial',
    'less than 1 gal'],
];

for (const [name, slug, state, units, expected] of cases) {
  const calc = window.Calcs[slug];
  const r = calc.Component.compute(state, units);
  console.log(`\n--- ${name}`);
  console.log(`  expect: ${expected}`);
  console.log(`  primary: ${fmt.dec(r.primary.value, r.primary.decimals)} ${r.primary.unit} (${r.primary.label})`);
  console.log(`  sub: ${r.sub}`);
  console.log(`  breakdown:`);
  r.breakdown.forEach(b => console.log(`    ${b.label}: ${b.value}`));
}
