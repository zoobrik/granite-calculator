// Calculator components: Paint, Concrete, Drywall
// Each calculator is "controlled": state is owned by the page (calc-pages.jsx),
// passed in as { state, setField, units }. The .compute function on each calc
// is a pure function from state -> { primary, sub, breakdown } for the result panel.

const { useState: useS, useMemo: useM } = React;
const { NumberInput, PillToggle, Slider, fmt } = window.Primitives;

// Helper conversions
const toFeet = (v, isImp) => isImp ? v : (v || 0) * 3.28084;

// ============================================================
// PAINT CALCULATOR
// ============================================================
function PaintCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { length, width, height, doors, windows, coats, coverage, color } = state;
  const colors = ['#0a0a0a', '#3b3b3b', '#9b9b91', '#dfdcd2', '#c3a585', '#5b6b5a', '#1f3a4a'];

  const previewW = Math.min(220, 60 + (length || 0) * 8);
  const previewH = Math.min(110, 30 + (width || 0) * 4);

  return (
    <>
      <div className="field">
        <label className="field-label">Room dimensions <span className="field-hint">{isImp ? 'feet' : 'meters'}</span></label>
        <div className="field-row">
          <NumberInput value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={1} max={200}/>
          <NumberInput value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={1} max={200}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Ceiling height</label>
        <NumberInput
          value={height}
          onChange={(v) => setField('height', v)}
          unit={isImp ? 'ft' : 'm'}
          min={isImp ? 6 : 1.8}
          max={isImp ? 30 : 9}
          step={isImp ? 1 : 0.1}
        />
      </div>

      <div className="field">
        <div className="room-preview">
          <div className="room-preview-grid"/>
          <div className="room-rect" style={{ width: previewW, height: previewH, background: `color-mix(in srgb, ${color} 18%, transparent)`, borderColor: color }}>
            <div className="room-dim bottom mono">{fmt.dec(length || 0, 0)}{isImp ? "'" : 'm'}</div>
            <div className="room-dim right mono">{fmt.dec(width || 0, 0)}{isImp ? "'" : 'm'}</div>
          </div>
        </div>
      </div>

      <div className="subsection">
        <h3 className="subsection-title">Subtractions</h3>
        <div className="field-row">
          <div className="field" style={{ marginTop: 0 }}>
            <label className="field-label">Doors <span className="field-hint">21 sq ft each</span></label>
            <NumberInput value={doors} onChange={(v) => setField('doors', v)} min={0} max={20}/>
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <label className="field-label">Windows <span className="field-hint">15 sq ft each</span></label>
            <NumberInput value={windows} onChange={(v) => setField('windows', v)} min={0} max={20}/>
          </div>
        </div>
      </div>

      <div className="subsection">
        <h3 className="subsection-title">Paint settings</h3>
        <div className="field" style={{ marginTop: 0 }}>
          <label className="field-label">Coats</label>
          <Slider value={coats || 1} onChange={(v) => setField('coats', v)} min={1} max={4} step={1} format={v => `${v} coat${v > 1 ? 's' : ''}`}/>
        </div>
        <div className="field">
          <label className="field-label">Coverage <span className="field-hint">{isImp ? 'sq ft / gallon' : 'm² / liter'}</span></label>
          <NumberInput value={coverage} onChange={(v) => setField('coverage', v)} unit={isImp ? 'sf/gal' : 'm²/L'} min={isImp ? 50 : 1} max={isImp ? 600 : 15}/>
        </div>
        <div className="field">
          <label className="field-label">Accent <span className="field-hint">preview only</span></label>
          <div className="swatch-row">
            {colors.map(c => (
              <button
                key={c}
                className={`swatch ${color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setField('color', c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

PaintCalculator.compute = function paintCompute(state, units) {
  const isImp = units === 'imperial';
  const { length, width, height, doors, windows, coats, coverage } = state;
  const L = toFeet(length, isImp), W = toFeet(width, isImp), H = toFeet(height, isImp);
  const wallArea  = 2 * (L + W) * H;
  const doorArea  = (doors || 0) * 21;
  const winArea   = (windows || 0) * 15;
  const paintable = Math.max(0, wallArea - doorArea - winArea);
  const totalArea = paintable * (coats || 1);
  // Coverage is unit-matched: sf/gal in imperial, m²/L in metric. 1 m²/L ≈ 40.74 sf/gal.
  const sfPerGal = isImp ? (coverage || 350) : (coverage || 8.6) * 40.7458;
  const gallons = sfPerGal > 0 ? totalArea / sfPerGal : 0;
  const liters = gallons * 3.78541;
  const ceilG = Math.ceil(gallons);
  const ceilL = Math.ceil(liters);
  const totalAreaSm = totalArea * 0.092903;

  return {
    primary: { value: isImp ? gallons : liters, decimals: 1, unit: isImp ? 'gallons' : 'liters', label: 'You need to buy' },
    sub: isImp
      ? `Covers ${fmt.int(paintable)} sq ft with ${coats || 1} coat${(coats || 1) > 1 ? 's' : ''}. Order ${ceilG} gallon${ceilG === 1 ? '' : 's'} (round up to the next whole can; keep an unopened quart for touch-ups).`
      : `Covers ${fmt.int(paintable * 0.092903)} m² with ${coats || 1} coat${(coats || 1) > 1 ? 's' : ''}. Order ${ceilL} liter${ceilL === 1 ? '' : 's'} (round up to the next whole can).`,
    breakdown: isImp ? [
      { label: 'Wall area (gross)', value: `${fmt.int(wallArea)} sq ft` },
      { label: 'Doors & windows',   value: `−${fmt.int(doorArea + winArea)} sq ft` },
      { label: 'Paintable surface', value: `${fmt.int(paintable)} sq ft` },
      { label: 'Total coverage',    value: `${fmt.int(totalArea)} sq ft` },
      { label: 'Cans (1 gal)',      value: `${ceilG}` },
    ] : [
      { label: 'Wall area (gross)', value: `${fmt.dec(wallArea * 0.092903, 1)} m²` },
      { label: 'Doors & windows',   value: `−${fmt.dec((doorArea + winArea) * 0.092903, 1)} m²` },
      { label: 'Paintable surface', value: `${fmt.dec(paintable * 0.092903, 1)} m²` },
      { label: 'Total coverage',    value: `${fmt.dec(totalAreaSm, 1)} m²` },
      { label: 'Cans (1 L)',        value: `${ceilL}` },
    ],
  };
};
PaintCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const m2ft = 3.28084, ft2m = 0.3048;
  const sfg2smL = 0.02455; // sf/gal → sm/L
  if (from === 'imperial' && to === 'metric') {
    return {
      ...state,
      length: +(state.length * ft2m).toFixed(2),
      width:  +(state.width * ft2m).toFixed(2),
      height: +(state.height * ft2m).toFixed(2),
      coverage: +(state.coverage * sfg2smL).toFixed(1),
    };
  }
  return {
    ...state,
    length: +(state.length * m2ft).toFixed(1),
    width:  +(state.width * m2ft).toFixed(1),
    height: +(state.height * m2ft).toFixed(1),
    coverage: +(state.coverage / sfg2smL).toFixed(0),
  };
};

// ============================================================
// CONCRETE CALCULATOR
// ============================================================
function ConcreteCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { shape, length, width, diameter, thickness } = state;

  return (
    <>
      <div className="field">
        <label className="field-label">Shape</label>
        <div className="shape-options">
          <button className={`shape-option ${shape === 'rect' ? 'active' : ''}`} onClick={() => setField('shape', 'rect')}>
            <Icons.Rectangle size={22}/>
            <span>Rectangle</span>
          </button>
          <button className={`shape-option ${shape === 'circle' ? 'active' : ''}`} onClick={() => setField('shape', 'circle')}>
            <Icons.Circle size={22}/>
            <span>Round tube</span>
          </button>
          <button className={`shape-option ${shape === 'triangle' ? 'active' : ''}`} onClick={() => setField('shape', 'triangle')}>
            <Icons.Triangle size={22}/>
            <span>Triangle</span>
          </button>
        </div>
      </div>

      {shape === 'rect' && (
        <div className="field">
          <label className="field-label">Dimensions</label>
          <div className="field-row">
            <NumberInput value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={500}/>
            <NumberInput value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={500}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
            <span>Length</span><span>Width</span>
          </div>
        </div>
      )}

      {shape === 'circle' && (
        <div className="field">
          <label className="field-label">Diameter</label>
          <NumberInput value={diameter} onChange={(v) => setField('diameter', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={50}/>
        </div>
      )}

      {shape === 'triangle' && (
        <div className="field">
          <label className="field-label">Base × Height</label>
          <div className="field-row">
            <NumberInput value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={500}/>
            <NumberInput value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={500}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
            <span>Base</span><span>Height</span>
          </div>
        </div>
      )}

      <div className="field">
        <label className="field-label">Thickness <span className="field-hint">{isImp ? 'inches' : 'mm'}</span></label>
        <Slider value={thickness} onChange={(v) => setField('thickness', v)} min={isImp ? 2 : 50} max={isImp ? 24 : 600} step={isImp ? 0.5 : 10} format={v => `${v}${isImp ? '"' : ' mm'}`}/>
      </div>

      <div className="subsection">
        <h3 className="subsection-title">Reference</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'var(--fg-muted)' }}>
          <div>Walkway / patio: <span className="mono" style={{ color: 'var(--fg)' }}>4"</span></div>
          <div>Driveway: <span className="mono" style={{ color: 'var(--fg)' }}>4–6"</span></div>
          <div>Garage slab: <span className="mono" style={{ color: 'var(--fg)' }}>6"</span></div>
          <div>Footing: <span className="mono" style={{ color: 'var(--fg)' }}>8–12"</span></div>
        </div>
      </div>
    </>
  );
}

ConcreteCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const m2ft = 3.28084, ft2m = 0.3048;
  if (from === 'imperial' && to === 'metric') {
    return {
      ...state,
      length: +(state.length * ft2m).toFixed(2),
      width:  +(state.width * ft2m).toFixed(2),
      diameter: +(state.diameter * ft2m).toFixed(2),
      thickness: Math.round((state.thickness || 0) * 25.4 / 10) * 10,
    };
  }
  return {
    ...state,
    length: +(state.length * m2ft).toFixed(1),
    width:  +(state.width * m2ft).toFixed(1),
    diameter: +(state.diameter * m2ft).toFixed(1),
    thickness: +((state.thickness || 0) / 25.4).toFixed(1),
  };
};

ConcreteCalculator.compute = function concreteCompute(state, units) {
  const isImp = units === 'imperial';
  const { shape, length, width, diameter, thickness } = state;
  const L = toFeet(length, isImp), W = toFeet(width, isImp), D = toFeet(diameter, isImp);
  const tFt = isImp ? (thickness || 0) / 12 : (thickness || 0) / 1000 * 3.28084;
  let area;
  if (shape === 'rect') area = L * W;
  else if (shape === 'circle') area = Math.PI * Math.pow(D / 2, 2);
  else area = 0.5 * L * W;
  const cuFt = area * tFt;
  const cuYd = cuFt / 27;
  const cuM  = cuFt * 0.0283168;
  const bags60 = Math.ceil(cuFt / 0.45);
  const bags80 = Math.ceil(cuFt / 0.60);
  const truckMin = Math.max(0, cuYd * 1.1);

  const areaSm = area * 0.092903;
  const truckMinM3 = truckMin * 0.7646;
  return {
    primary: { value: isImp ? cuYd : cuM, decimals: 2, unit: isImp ? 'cu yd' : 'cu m', label: 'Volume of concrete' },
    sub: isImp
      ? `Order ${fmt.dec(truckMin, 2)} yd³ to allow 10% waste, or buy ${bags60} bags of 60 lb pre-mix.`
      : `Order ${fmt.dec(truckMinM3, 2)} m³ to allow 10% waste, or buy ${bags60} bags of 27 kg (60 lb) pre-mix.`,
    breakdown: isImp ? [
      { label: 'Surface area', value: `${fmt.dec(area, 1)} sq ft` },
      { label: 'Thickness',    value: `${thickness}"` },
      { label: 'Volume',       value: `${fmt.dec(cuFt, 2)} ft³` },
      { label: '60 lb bags',   value: `${bags60} bags` },
      { label: '80 lb bags',   value: `${bags80} bags` },
    ] : [
      { label: 'Surface area', value: `${fmt.dec(areaSm, 2)} m²` },
      { label: 'Thickness',    value: `${thickness} mm` },
      { label: 'Volume',       value: `${fmt.dec(cuM, 3)} m³` },
      { label: '60 lb (27 kg) bags', value: `${bags60} bags` },
      { label: '80 lb (36 kg) bags', value: `${bags80} bags` },
    ],
  };
};

// ============================================================
// DRYWALL CALCULATOR
// ============================================================
function DrywallCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { length, width, height, sheetSize, ceiling, doors, windows } = state;

  return (
    <>
      <div className="field">
        <label className="field-label">Room dimensions <span className="field-hint">{isImp ? 'feet' : 'meters'}</span></label>
        <div className="field-row">
          <NumberInput value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={1} max={200}/>
          <NumberInput value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={1} max={200}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Ceiling height</label>
        <NumberInput
          value={height}
          onChange={(v) => setField('height', v)}
          unit={isImp ? 'ft' : 'm'}
          min={isImp ? 6 : 1.8}
          max={isImp ? 20 : 6}
          step={isImp ? 1 : 0.1}
        />
      </div>

      <div className="field">
        <label className="field-label">Sheet size</label>
        <div className="sheet-options">
          <button className={`sheet-option ${sheetSize === '4x8' ? 'active' : ''}`} onClick={() => setField('sheetSize', '4x8')}>
            <div className="sheet-option-rect" style={{ height: 18 }}/>
            <div className="sheet-option-info">
              <span className="sheet-option-title">4 × 8 ft</span>
              <span className="sheet-option-sub">32 sq ft / sheet</span>
            </div>
          </button>
          <button className={`sheet-option ${sheetSize === '4x12' ? 'active' : ''}`} onClick={() => setField('sheetSize', '4x12')}>
            <div className="sheet-option-rect" style={{ height: 14, width: 44 }}/>
            <div className="sheet-option-info">
              <span className="sheet-option-title">4 × 12 ft</span>
              <span className="sheet-option-sub">48 sq ft / sheet</span>
            </div>
          </button>
        </div>
      </div>

      <div className="subsection">
        <h3 className="subsection-title">Options</h3>
        <div className="field" style={{ marginTop: 0 }}>
          <label className="field-label">Coverage area</label>
          <PillToggle
            options={[{ label: 'Walls only', value: 'walls' }, { label: 'Walls + ceiling', value: 'all' }]}
            value={ceiling ? 'all' : 'walls'}
            onChange={(v) => setField('ceiling', v === 'all')}
          />
        </div>
        <div className="field-row" style={{ marginTop: 20 }}>
          <div className="field" style={{ marginTop: 0 }}>
            <label className="field-label">Doors</label>
            <NumberInput value={doors} onChange={(v) => setField('doors', v)} min={0} max={20}/>
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <label className="field-label">Windows</label>
            <NumberInput value={windows} onChange={(v) => setField('windows', v)} min={0} max={20}/>
          </div>
        </div>
      </div>
    </>
  );
}

DrywallCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return {
    ...state,
    length: +(state.length * k).toFixed(dec),
    width:  +(state.width * k).toFixed(dec),
    height: +(state.height * k).toFixed(dec),
  };
};

DrywallCalculator.compute = function drywallCompute(state, units) {
  const isImp = units === 'imperial';
  const { length, width, height, sheetSize, ceiling, doors, windows } = state;
  const L = toFeet(length, isImp), W = toFeet(width, isImp), H = toFeet(height, isImp);
  const wallArea = 2 * (L + W) * H;
  const ceilingArea = ceiling ? L * W : 0;
  const openings = (doors || 0) * 21 + (windows || 0) * 15;
  // Sheets: deduct openings (cuts produce some scrap, partially offset by 10% waste factor).
  const sheetCoverArea = Math.max(0, wallArea + ceilingArea - openings);
  const sheetArea = sheetSize === '4x8' ? 32 : 48;
  const sheets = Math.ceil((sheetCoverArea / sheetArea) * 1.10);
  // Finishing materials use installed sheet area (you tape and mud around openings too).
  const installedArea = wallArea + ceilingArea;
  const mudGal = Math.ceil(installedArea * 0.014 * 10) / 10;          // ~14 gal / 1000 sf, USG 3-coat reference
  const tapeLf = Math.ceil(installedArea * 0.33);                       // ~330 lf / 1000 sf, USG reference
  const wallSfNet = Math.max(0, wallArea - openings);
  const screws = Math.ceil(wallSfNet * 1.0 + ceilingArea * 1.5);        // walls 1/sf @ 16" oc; ceilings 1.5/sf @ 12" oc

  const sm = (sf) => sf * 0.092903;
  const m = (lf) => lf * 0.3048;
  const liters = (gal) => gal * 3.78541;

  return {
    primary: { value: sheets, decimals: 0, unit: sheetSize === '4x8' ? 'sheets (4×8)' : 'sheets (4×12)', label: 'Drywall needed' },
    sub: isImp
      ? `Covers ${fmt.int(sheetCoverArea)} sq ft with 10% waste. You'll also need ${mudGal} gal of joint compound and ${fmt.int(tapeLf)} lf of paper tape.`
      : `Covers ${fmt.dec(sm(sheetCoverArea), 1)} m² with 10% waste. You'll also need ${fmt.dec(liters(mudGal), 1)} L of joint compound and ${fmt.dec(m(tapeLf), 1)} m of paper tape.`,
    breakdown: isImp ? [
      { label: 'Wall area',       value: `${fmt.int(wallArea)} sq ft` },
      { label: 'Ceiling',         value: ceiling ? `${fmt.int(ceilingArea)} sq ft` : 'Not included' },
      { label: 'Openings',        value: `−${fmt.int(openings)} sq ft` },
      { label: 'Joint compound',  value: `${mudGal} gal` },
      { label: 'Paper tape',      value: `${fmt.int(tapeLf)} lf` },
      { label: 'Drywall screws',  value: `~${fmt.int(screws)}` },
    ] : [
      { label: 'Wall area',       value: `${fmt.dec(sm(wallArea), 1)} m²` },
      { label: 'Ceiling',         value: ceiling ? `${fmt.dec(sm(ceilingArea), 1)} m²` : 'Not included' },
      { label: 'Openings',        value: `−${fmt.dec(sm(openings), 1)} m²` },
      { label: 'Joint compound',  value: `${fmt.dec(liters(mudGal), 1)} L` },
      { label: 'Paper tape',      value: `${fmt.dec(m(tapeLf), 1)} m` },
      { label: 'Drywall screws',  value: `~${fmt.int(screws)}` },
    ],
  };
};

// Registry
window.Calcs = {
  'wall-paint': {
    Component: PaintCalculator,
    initial: { length: 12, width: 14, height: 8, doors: 1, windows: 2, coats: 2, coverage: 350, color: '#5b6b5a' },
    title: 'Wall Paint Calculator',
    subtitle: 'Calculate how much paint you need for any room, with or without subtractions for doors and windows.',
    category: 'paint',
    formula: [
      ['wall area',     '= 2 × (L + W) × H'],
      ['paintable',     '= wall area − (doors × 21) − (windows × 15)'],
      ['total coverage','= paintable × coats'],
      ['gallons',       '= total coverage ÷ coverage per gal'],
    ],
    howWorks: `The math is simpler than the paint store makes it look. We measure your four walls as a rectangle (perimeter × height), subtract the average door (21 sq ft) and window (15 sq ft), multiply by how many coats you want, and divide by the coverage your paint specifies. Most interior latex paint covers around 350 sq ft per gallon — but check the can. The formulas above are exactly what we compute, with no fudge factor. Round up by 10% when you order so you have touch-up paint years down the road.`,
  },
  'concrete-slab': {
    Component: ConcreteCalculator,
    initial: { shape: 'rect', length: 10, width: 10, diameter: 4, thickness: 4 },
    title: 'Concrete Slab Calculator',
    subtitle: 'Find cubic yards and bag counts for any rectangular, round, or triangular concrete pour.',
    category: 'concrete',
    formula: [
      ['rectangle area', '= L × W'],
      ['round area',     '= π × (D ÷ 2)²'],
      ['volume (ft³)',   '= area × (thickness ÷ 12)'],
      ['cubic yards',    '= volume ÷ 27'],
      ['60 lb bags',     '= ceil(volume ÷ 0.45 ft³)'],
    ],
    howWorks: `Concrete is sold by the cubic yard from a truck and by the bag at the hardware store. We compute the volume of your pour in cubic feet, then convert to yards — there are 27 cubic feet in a yard. For bagged concrete: a 60 lb bag yields 0.45 cubic feet and an 80 lb bag yields 0.60 cubic feet. Always order roughly 10% more than the raw number to allow for uneven subgrade and spillage. Trucks have a minimum charge, so a small pour may cost the same as a slightly bigger one.`,
  },
  'drywall-sheets': {
    Component: DrywallCalculator,
    initial: { length: 12, width: 14, height: 8, sheetSize: '4x8', ceiling: true, doors: 1, windows: 2 },
    title: 'Drywall Sheet Calculator',
    subtitle: 'Sheets, joint compound, tape, and screws for any room — 4×8 or 4×12.',
    category: 'drywall',
    formula: [
      ['wall area',  '= 2 × (L + W) × H'],
      ['sheet area', '= walls + ceiling − openings'],
      ['sheets',     '= ceil(sheet area ÷ sheet size × 1.10)'],
      ['mud',        '= installed area × 0.014 gal/sq ft'],
      ['tape',       '= installed area × 0.33 lf/sq ft'],
      ['screws',     '= walls × 1 + ceiling × 1.5 / sq ft'],
    ],
    howWorks: `Drywall comes in 4-foot-wide sheets that are 8, 10, or 12 feet long. Bigger sheets mean fewer joints to tape — pros prefer 4×12 when the space allows. We compute the total surface area (walls plus ceiling if checked), subtract openings for doors and windows for the sheet count, and add 10% waste for cut scrap. Mud, tape, and screws use the full installed area without deducting openings — you tape and mud around door and window returns too. Industry references: USG specifies about 14 gallons of compound and 330 linear feet of paper tape per 1,000 sq ft of drywall in a standard 3-coat finish. Screws follow framing spacing — about one per square foot on walls (16" o.c.) and 1.5 per square foot on ceilings (12" o.c.).`,
  },
};
