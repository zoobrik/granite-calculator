// Standalone node test harness — verifies every Calc.compute() against
// hand-checked reference values. Mocks window/React/Icons just enough to
// load the compute functions from the source files without a browser.

const fs = require('fs');
const path = require('path');

// --- Minimal mocks ---------------------------------------------------------
global.React = {
  useState: () => [null, () => {}],
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: () => ({ current: null }),
  useCallback: (fn) => fn,
};

const fmt = {
  num: (n, d = 0) => isFinite(n) ? Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '0',
  int: (n) => fmt.num(n, 0),
  dec: (n, d = 2) => fmt.num(n, d),
};

global.window = {
  Primitives: {
    fmt,
    NumberInput: () => null, PillToggle: () => null, Slider: () => null,
    AnimatedNumber: () => null, useTheme: () => [null, () => {}],
    useLocalStorage: () => [null, () => {}], useCountUp: (v) => v, useToast: () => [() => {}, null],
  },
  Calcs: {},
  Data: {},
  Icons: new Proxy({}, { get: () => () => null }),
};
global.Icons = global.window.Icons;

// --- Load source files (strip JSX-only chunks via Babel) ------------------
const babel = (() => {
  try { return require('/tmp/parsechk/node_modules/@babel/core'); }
  catch { return null; }
})();

if (!babel) {
  console.error('Need @babel/core. Install: cd /tmp/parsechk && npm i @babel/core @babel/preset-env @babel/plugin-syntax-jsx');
  process.exit(1);
}

const srcDir = path.join(__dirname, '..', 'src');
// Skip icons.jsx — `Icons` is mocked above as a Proxy.
const order = [
  'data.jsx',
  'primitives.jsx',
  'calculators.jsx',
  'more-calculators.jsx',
  'extra-calculators.jsx',
];

for (const f of order) {
  let code = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const transpiled = babel.transformSync(code, {
    presets: [[require.resolve('/tmp/parsechk/node_modules/@babel/preset-env'), { targets: { node: 'current' } }]],
    plugins: [[require.resolve('/tmp/parsechk/node_modules/@babel/plugin-transform-react-jsx'), { runtime: 'classic' }]],
  }).code;
  try {
    // Wrap in a function so any top-level `const`s are scoped to the file —
    // matches the browser, where each <script> has its own scope.
    new Function('window', 'React', 'Icons', transpiled)
      (global.window, global.React, global.Icons);
  } catch (e) {
    console.error(`load ${f}:`, e.message);
    process.exit(1);
  }
}

// --- Test harness ---------------------------------------------------------
let pass = 0, fail = 0;
function near(actual, expected, tolerance = 0.05) {
  if (typeof expected !== 'number') return actual === expected;
  return Math.abs(actual - expected) <= Math.abs(expected * tolerance) + 0.001;
}
function test(name, slug, state, units, checks) {
  const calc = window.Calcs[slug];
  if (!calc) { fail++; console.log(`✗ ${name} — missing calc`); return; }
  const result = calc.Component.compute(state, units);
  const issues = [];
  for (const [path, expected, tol] of checks) {
    let actual;
    if (path === 'primary.value') actual = result.primary.value;
    else if (path === 'primary.unit') actual = result.primary.unit;
    else if (path === 'sub') actual = result.sub;
    else if (path.startsWith('breakdown.')) {
      const [, idx, field] = path.split('.');
      actual = result.breakdown[+idx]?.[field];
    }
    const ok = typeof expected === 'function' ? expected(actual) : near(actual, expected, tol);
    if (!ok) issues.push(`  ${path}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
  if (issues.length === 0) { pass++; console.log(`✓ ${name}`); }
  else { fail++; console.log(`✗ ${name}`); for (const i of issues) console.log(i); }
}

console.log('--- Calculator math verification ---\n');

// Wall paint: 12x14x8 room, 1 door, 2 windows, 2 coats, 350 cov
// walls = 2*26*8 = 416; openings = 21+30 = 51; paintable = 365; ×2 = 730 / 350 = 2.086 gal
test('wall-paint imperial', 'wall-paint',
  { length: 12, width: 14, height: 8, doors: 1, windows: 2, coats: 2, coverage: 350 }, 'imperial',
  [['primary.value', 2.086], ['primary.unit', 'gallons']]);

// Concrete slab: 10x10x4"
// area=100, thick=4/12=0.333, vol=33.33 ft³, /27 = 1.235 yd³
test('concrete-slab imperial', 'concrete-slab',
  { shape: 'rect', length: 10, width: 10, diameter: 4, thickness: 4 }, 'imperial',
  [['primary.value', 1.235], ['primary.unit', 'cu yd']]);

// Concrete circle: D=4 ft, 4" thick → π × 4 × 0.333 = 4.189 ft³ /27 = 0.155 yd³
test('concrete-circle imperial', 'concrete-slab',
  { shape: 'circle', length: 10, width: 10, diameter: 4, thickness: 4 }, 'imperial',
  [['primary.value', 0.155]]);

// Drywall: 12x14x8, 4x8 sheets, ceiling on, 1 door, 2 windows
// walls=416, ceiling=168, openings=51, sheetArea=533, sheets=ceil(533/32 * 1.10)=ceil(18.32)=19
test('drywall-sheets imperial', 'drywall-sheets',
  { length: 12, width: 14, height: 8, sheetSize: '4x8', ceiling: true, doors: 1, windows: 2 }, 'imperial',
  [['primary.value', 19, 0.001]]);

// Drywall finishing: 800 sf, standard
// mud = ceil(800 * 0.014 * 1 * 10)/10 = ceil(112)/10 = 11.2; buckets=ceil(11.2/4.5)=3
test('drywall-finishing 800sf standard', 'drywall-finishing',
  { area: 800, joints: 'standard' }, 'imperial',
  [['primary.value', 3, 0.001]]);

// Tile: 10x8, 10 sf/box, 10% waste
// area=80, adj=88, boxes=ceil(88/10)=9
test('tile-boxes 10x8 std', 'tile-boxes',
  { length: 10, width: 8, tilePerBox: 10, waste: 10, pattern: 'straight' }, 'imperial',
  [['primary.value', 9, 0.001]]);

// Roof pitch 6/12: ratio=0.5, deg=26.565°
test('roof-pitch 6/12', 'roof-pitch',
  { rise: 6, run: 12 }, 'imperial',
  [['primary.value', 6, 0.001]]);

// Board feet: 2x4x8 ft × 10 = (2*4*8/12)*10 = 53.33
test('board-feet 2x4x8 qty10', 'board-feet',
  { thickness: 2, width: 4, length: 8, qty: 10 }, 'imperial',
  [['primary.value', 53.333, 0.001]]);

// Mulch: 20x6 rect, 3" depth
// area=120, depth=0.25 ft, vol=30 ft³ /27=1.111 yd³; bags ceil(30/2)=15
test('mulch 20x6 rect 3in', 'mulch',
  { shape: 'rect', length: 20, width: 6, diameter: 10, depth: 3 }, 'imperial',
  [['primary.value', 1.111, 0.01]]);

// Stair stringer: 108" rise, target 7.5"
// numRisers=round(108/7.5)=round(14.4)=14; actualRiser=108/14=7.714
test('stair 108 target 7.5', 'stair-stringer',
  { totalRise: 108, riserHeight: 7.5 }, 'imperial',
  [['primary.value', 14, 0.001]]);

// Gravel: 20x10, 4" depth, crushed
// area=200, vol=200*0.333=66.66 ft³ /27=2.469 yd³; tons=2.469*1.5=3.70
test('gravel 20x10 4in crushed', 'gravel',
  { length: 20, width: 10, depth: 4, gravelType: 'crushed' }, 'imperial',
  [['primary.value', 2.469, 0.01]]);

// Square footage: single 12x10 rect
test('sqft single rect 12x10', 'square-footage',
  { shapes: [{ id: 1, type: 'rect', length: 12, width: 10, diameter: 6 }] }, 'imperial',
  [['primary.value', 120, 0.001]]);

// Footing pier: 12" tube, 4 ft tall, qty 6
// dFt=1, area=π*0.5² = 0.785, vol/each = 0.785*4=3.14 ft³, total=18.85, /27=0.698 yd³
test('footing 12in tube 4ft qty6', 'footing-pier',
  { type: 'tube', diameter: 12, length: 2, width: 2, height: 4, qty: 6 }, 'imperial',
  [['primary.value', 0.698, 0.01]]);

// Grout: 100 sf, 12" tile, 1/8" joint, std (0.5" depth)
// volPerSf = 288*0.125*0.5/12 = 1.5 in³/sf; lbs/sf = 0.195; total=100*0.195*1.10=21.45 lbs; bags=ceil(21.45/25)=1
// thinset: 100*1.0*1.10/80 = 1.375; bags=ceil=2
test('grout 100sf 12in 1/8 joint std', 'grout-thinset',
  { area: 100, tileSize: 12, jointWidth: 0.125, thickness: 'standard' }, 'imperial',
  [['primary.value', 2, 0.001]]); // primary is thinset bags

// Shingles: 40x30 footprint, 6/12 pitch, 50 lf ridge, 2 valleys
// footprint=1200; mult=√1.25=1.118; roofArea=1342; waste=0.10+0.04=0.14; areaWithWaste=1530;
// squares=15.30; bundles=ceil(15.3*3)=ceil(45.9)=46
test('shingles 40x30 6/12 50lf 2valley', 'shingle-bundles',
  { length: 40, width: 30, pitch: 6, ridgeLf: 50, valleys: 2 }, 'imperial',
  [['primary.value', 46, 0.001]]);

// Deck: 16x12, 5.5" boards, 12 ft stock, length orientation, 1/8 gap
// runLengthFt=16, perpFt=12; rowsAcross=ceil(144/(5.5+0.125))=ceil(144/5.625)=ceil(25.6)=26
// boardsPerRow=ceil(16/12)=2; total=52
test('deck 16x12 5.5in 12ft length 1/8gap', 'deck-boards',
  { length: 16, width: 12, boardWidth: 5.5, boardLength: 12, orientation: 'length', gap: 0.125 }, 'imperial',
  [['primary.value', 52, 0.001]]);

// Sod: 30x20, slab
// sf=600, withWaste=642, pallets=ceil(642/450)=2
test('sod 30x20 slab', 'sod',
  { length: 30, width: 20, sodType: 'slab' }, 'imperial',
  [['primary.value', 2, 0.001]]);

// Trim/ceiling: 14x12x8, 4" trim, 2 doors, 2 windows, 2 coats
// ceiling area = 168; perim=52; trimSf=52*4/12=17.333; doorTrim=10; winTrim=9; trimAreaSf=36.33
// totalTrim=72.66; ceilingTotal=336; ceilingGal=336/350=0.96; trimGal=72.66/400=0.182; total=1.142
test('trim-ceiling 14x12x8 4in 2d 2w 2coats', 'trim-ceiling-paint',
  { length: 14, width: 12, height: 8, trimWidth: 4, doors: 2, windows: 2, coats: 2 }, 'imperial',
  [['primary.value', 1.142, 0.02]]);

// --- Edge cases ---------------------------------------------------------------
console.log('\n--- Edge cases ---\n');

// Zero / empty inputs shouldn't crash or return NaN
test('paint zero inputs', 'wall-paint',
  { length: 0, width: 0, height: 0, doors: 0, windows: 0, coats: 1, coverage: 350 }, 'imperial',
  [['primary.value', 0, 0.001]]);

test('drywall zero inputs', 'drywall-sheets',
  { length: 0, width: 0, height: 0, sheetSize: '4x8', ceiling: false, doors: 0, windows: 0 }, 'imperial',
  [['primary.value', 0, 0.001]]);

// Empty string inputs (NumberInput passes '' when user clears)
test('paint empty strings', 'wall-paint',
  { length: '', width: '', height: '', doors: '', windows: '', coats: '', coverage: '' }, 'imperial',
  [['primary.value', (v) => v === 0 || isNaN(v) === false]]);

// Very large room
test('paint big room', 'wall-paint',
  { length: 50, width: 80, height: 12, doors: 4, windows: 8, coats: 2, coverage: 350 }, 'imperial',
  [['primary.value', 17.81, 0.05]]);

// Concrete with thickness='' (clear) — historical bug source
test('concrete empty thickness', 'concrete-slab',
  { shape: 'rect', length: 10, width: 10, diameter: 4, thickness: '' }, 'imperial',
  [['primary.value', 0, 0.001]]);

// Stair stringer: code violation case
const stairBig = window.Calcs['stair-stringer'].Component.compute({ totalRise: 120, riserHeight: 8 });
console.log(stairBig.sub.includes('exceeds')
  ? '✓ stair code-violation warning fires'
  : '✗ stair code-violation warning MISSING');

// Roof pitch: 0/0 division by zero
test('roof-pitch zero', 'roof-pitch',
  { rise: 0, run: 0 }, 'imperial',
  [['primary.value', 0, 0.001]]);

// Square footage with 0 shapes
test('sqft empty shapes', 'square-footage',
  { shapes: [] }, 'imperial',
  [['primary.value', 0, 0.001]]);

// Tile with 0 box coverage (div by zero)
test('tile zero box coverage', 'tile-boxes',
  { length: 10, width: 8, tilePerBox: 0, waste: 10, pattern: 'straight' }, 'imperial',
  [['primary.value', (v) => isFinite(v) && v >= 0]]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
