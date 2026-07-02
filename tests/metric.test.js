// Metric mode + convertState round-trip verification.
const { loadCalcs } = require('./load-calcs');
loadCalcs();

let pass = 0, fail = 0;

function near(a, b, tol = 0.05) {
  if (typeof b !== 'number') return a === b;
  return Math.abs(a - b) <= Math.abs(b * tol) + 0.001;
}

function metricEquivalent(name, slug, impState, metState) {
  const calc = window.Calcs[slug];
  const impR = calc.Component.compute(impState, 'imperial');
  const metR = calc.Component.compute(metState, 'metric');
  // The PRIMARY value in metric should be the imperial value converted to metric.
  // Map by unit:
  const impV = impR.primary.value, impU = impR.primary.unit;
  const metV = metR.primary.value, metU = metR.primary.unit;
  // Conversions
  let expectedMet = impV;
  if (impU === 'gallons' && metU === 'liters') expectedMet = impV * 3.78541;
  else if (impU === 'cu yd' && metU === 'cu m') expectedMet = impV * 0.7646;
  else if (impU === 'cubic yards' && metU === 'm³') expectedMet = impV * 0.7646;
  else if (impU === 'sq ft' && metU === 'm²') expectedMet = impV * 0.092903;
  else if (impU === metU) expectedMet = impV;  // same units (boxes, sheets, bundles, etc.)
  else { fail++; console.log(`✗ ${name}: unmapped units ${impU} → ${metU}`); return; }
  const ok = near(metV, expectedMet, 0.02);
  if (ok) { pass++; console.log(`✓ ${name} (${impV} ${impU} ≈ ${metV} ${metU})`); }
  else { fail++; console.log(`✗ ${name}: imp=${impV} ${impU}, met=${metV} ${metU}, expected ${expectedMet} ${metU}`); }
}

function roundTrip(name, slug, impState) {
  const calc = window.Calcs[slug];
  if (!calc.Component.convertState) { console.log(`- ${name}: no convertState (skip)`); return; }
  const met = calc.Component.convertState(impState, 'imperial', 'metric');
  const back = calc.Component.convertState(met, 'metric', 'imperial');
  // Compare original and round-trip on numeric fields
  const drift = [];
  for (const k of Object.keys(impState)) {
    const o = impState[k], b = back[k];
    if (typeof o === 'number' && typeof b === 'number') {
      const d = Math.abs(o - b);
      if (d > Math.abs(o * 0.05) + 0.5) drift.push(`${k}: ${o} → ${b}`);
    }
  }
  if (drift.length === 0) { pass++; console.log(`✓ ${name} round-trip stable`); }
  else { fail++; console.log(`✗ ${name} round-trip drift:`); drift.forEach(d => console.log(`  ${d}`)); }
}

console.log('--- Metric output equivalence ---\n');

// Wall paint: 12 ft × 14 ft × 8 ft = 3.6576 m × 4.2672 m × 2.4384 m
// 350 sf/gal = 8.59 m²/L
metricEquivalent('wall-paint',
  'wall-paint',
  { length: 12, width: 14, height: 8, doors: 1, windows: 2, coats: 2, coverage: 350 },
  { length: 3.66, width: 4.27, height: 2.44, doors: 1, windows: 2, coats: 2, coverage: 8.6 });

// Concrete: same room sizes
metricEquivalent('concrete-slab',
  'concrete-slab',
  { shape: 'rect', length: 10, width: 10, diameter: 4, thickness: 4 },
  { shape: 'rect', length: 3.05, width: 3.05, diameter: 1.22, thickness: 100 });

// Drywall — units stay as "sheets" so easy to verify
metricEquivalent('drywall-sheets',
  'drywall-sheets',
  { length: 12, width: 14, height: 8, sheetSize: '4x8', ceiling: true, doors: 1, windows: 2 },
  { length: 3.66, width: 4.27, height: 2.44, sheetSize: '4x8', ceiling: true, doors: 1, windows: 2 });

// Tile (boxes — same units)
metricEquivalent('tile-boxes',
  'tile-boxes',
  { length: 10, width: 8, tilePerBox: 10, waste: 10, pattern: 'straight' },
  { length: 3.05, width: 2.44, tilePerBox: 0.93, waste: 10, pattern: 'straight' });

// Mulch
metricEquivalent('mulch',
  'mulch',
  { shape: 'rect', length: 20, width: 6, diameter: 10, depth: 3 },
  { shape: 'rect', length: 6.10, width: 1.83, diameter: 3.05, depth: 7.62 });

// Gravel
metricEquivalent('gravel',
  'gravel',
  { length: 20, width: 10, depth: 4, gravelType: 'crushed' },
  { length: 6.10, width: 3.05, depth: 10, gravelType: 'crushed' });

// Footing pier — diameter in cm
metricEquivalent('footing-pier',
  'footing-pier',
  { type: 'tube', diameter: 12, length: 2, width: 2, height: 4, qty: 6 },
  { type: 'tube', diameter: 30.48, length: 0.61, width: 0.61, height: 1.22, qty: 6 });

// Shingles
metricEquivalent('shingle-bundles',
  'shingle-bundles',
  { length: 40, width: 30, pitch: 6, ridgeLf: 50, valleys: 2 },
  { length: 12.19, width: 9.14, pitch: 6, ridgeLf: 15.24, valleys: 2 });

// Sod
metricEquivalent('sod',
  'sod',
  { length: 30, width: 20, sodType: 'slab' },
  { length: 9.14, width: 6.10, sodType: 'slab' });

// Trim ceiling
metricEquivalent('trim-ceiling',
  'trim-ceiling-paint',
  { length: 14, width: 12, height: 8, trimWidth: 4, doors: 2, windows: 2, coats: 2 },
  { length: 4.27, width: 3.66, height: 2.44, trimWidth: 4, doors: 2, windows: 2, coats: 2 });

// Square footage
metricEquivalent('square-footage',
  'square-footage',
  { shapes: [{ id: 1, type: 'rect', length: 12, width: 10, diameter: 6 }] },
  { shapes: [{ id: 1, type: 'rect', length: 3.66, width: 3.05, diameter: 1.83 }] });

console.log('\n--- convertState round-trip stability ---\n');

roundTrip('wall-paint', 'wall-paint', { length: 12, width: 14, height: 8, doors: 1, windows: 2, coats: 2, coverage: 350, color: '#000' });
roundTrip('concrete-slab', 'concrete-slab', { shape: 'rect', length: 10, width: 10, diameter: 4, thickness: 4 });
roundTrip('drywall-sheets', 'drywall-sheets', { length: 12, width: 14, height: 8, sheetSize: '4x8', ceiling: true, doors: 1, windows: 2 });
roundTrip('tile-boxes', 'tile-boxes', { length: 10, width: 8, tilePerBox: 10, waste: 10, pattern: 'straight' });
roundTrip('mulch', 'mulch', { shape: 'rect', length: 20, width: 6, diameter: 10, depth: 3 });
roundTrip('gravel', 'gravel', { length: 20, width: 10, depth: 4, gravelType: 'crushed' });
roundTrip('footing-pier', 'footing-pier', { type: 'tube', diameter: 12, length: 2, width: 2, height: 4, qty: 6 });
roundTrip('shingle-bundles', 'shingle-bundles', { length: 40, width: 30, pitch: 6, ridgeLf: 50, valleys: 2 });
roundTrip('sod', 'sod', { length: 30, width: 20, sodType: 'slab' });
roundTrip('trim-ceiling', 'trim-ceiling-paint', { length: 14, width: 12, height: 8, trimWidth: 4, doors: 2, windows: 2, coats: 2 });
roundTrip('square-footage', 'square-footage', { shapes: [{ id: 1, type: 'rect', length: 12, width: 10, diameter: 6 }] });
roundTrip('roof-pitch', 'roof-pitch', { rise: 6, run: 12 });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
