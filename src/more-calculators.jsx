// Remaining calculators: Tile, Roof Pitch, Board Feet, Mulch, Stair Stringer, Gravel, Square Footage
const { useState: useS2 } = React;
const { NumberInput: NI, PillToggle: PT, Slider: SL, fmt: F } = window.Primitives;
const toFt = (v, isImp) => isImp ? v : (v || 0) * 3.28084;

// ============================================================
// TILE BOX CALCULATOR
// ============================================================
function TileCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { length, width, tilePerBox, waste, pattern } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Surface dimensions <span className="field-hint">{isImp ? 'feet' : 'meters'}</span></label>
        <div className="field-row">
          <NI value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={200}/>
          <NI value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={200}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Box coverage <span className="field-hint">sq ft per box</span></label>
        <NI value={tilePerBox} onChange={(v) => setField('tilePerBox', v)} unit="sf/box" min={1} max={100}/>
      </div>
      <div className="subsection">
        <h3 className="subsection-title">Layout</h3>
        <div className="field" style={{ marginTop: 0 }}>
          <label className="field-label">Pattern</label>
          <PT
            options={[
              { label: 'Straight', value: 'straight' },
              { label: 'Diagonal', value: 'diagonal' },
              { label: 'Herringbone', value: 'herringbone' },
            ]}
            value={pattern}
            onChange={(v) => {
              setField('pattern', v);
              // Only auto-suggest waste if user hasn't customized away from a known default.
              if (waste === 10 || waste === 15 || waste === 20) {
                setField('waste', v === 'straight' ? 10 : v === 'diagonal' ? 15 : 20);
              }
            }}
          />
        </div>
        <div className="field">
          <label className="field-label">Waste factor <span className="field-hint">accounts for cuts & breakage</span></label>
          <SL value={waste} onChange={(v) => setField('waste', v)} min={5} max={30} step={1} format={v => `${v}%`}/>
        </div>
      </div>
    </>
  );
}
TileCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return {
    ...state,
    length: +(state.length * k).toFixed(dec),
    width:  +(state.width * k).toFixed(dec),
  };
};
TileCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const { length, width, tilePerBox, waste } = state;
  const area = toFt(length, isImp) * toFt(width, isImp);
  const adjusted = area * (1 + (waste || 0) / 100);
  const boxes = Math.ceil(adjusted / (tilePerBox || 10));
  const sqM = area * 0.092903;
  const adjSm = adjusted * 0.092903;
  const boxSm = (tilePerBox || 0) * 0.092903;
  return {
    primary: { value: boxes, decimals: 0, unit: boxes === 1 ? 'box' : 'boxes', label: 'Order this many' },
    sub: isImp
      ? `That's ${F.int(adjusted)} sq ft total with ${waste}% waste. Buy one extra box for future repairs from the same dye lot.`
      : `That's ${F.dec(adjSm, 2)} m² total with ${waste}% waste. Buy one extra box for future repairs from the same dye lot.`,
    breakdown: isImp ? [
      { label: 'Floor area',      value: `${F.dec(area, 1)} sq ft` },
      { label: 'Metric area',     value: `${F.dec(sqM, 2)} m²` },
      { label: 'Waste factor',    value: `+${waste}%` },
      { label: 'Total to cover',  value: `${F.int(adjusted)} sq ft` },
      { label: 'Coverage / box',  value: `${tilePerBox} sq ft` },
    ] : [
      { label: 'Floor area',      value: `${F.dec(sqM, 2)} m²` },
      { label: 'Imperial area',   value: `${F.dec(area, 1)} sq ft` },
      { label: 'Waste factor',    value: `+${waste}%` },
      { label: 'Total to cover',  value: `${F.dec(adjSm, 2)} m²` },
      { label: 'Coverage / box',  value: `${F.dec(boxSm, 2)} m²` },
    ],
  };
};

// ============================================================
// ROOF PITCH CALCULATOR
// ============================================================
function RoofPitchCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { rise, run } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Rise <span className="field-hint">vertical height</span></label>
        <NI value={rise} onChange={(v) => setField('rise', v)} unit={isImp ? 'in' : 'cm'} min={0} max={200}/>
      </div>
      <div className="field">
        <label className="field-label">Run <span className="field-hint">horizontal distance</span></label>
        <NI value={run} onChange={(v) => setField('run', v)} unit={isImp ? 'in' : 'cm'} min={1} max={200}/>
      </div>
      <div className="field">
        <div style={{ position: 'relative', height: 160, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
          <div className="room-preview-grid" style={{ position: 'absolute', inset: 0 }}/>
          <svg width="280" height="120" viewBox="0 0 280 120" style={{ position: 'relative' }}>
            {(() => {
              const r = parseFloat(rise) || 0;
              const ru = parseFloat(run) || 12;
              const scale = Math.min(60, 720 / Math.max(r, ru));
              const sR = Math.min(80, r * 80 / 24);
              const sRu = 200;
              const y2 = 100 - sR;
              return (
                <>
                  <line x1="40" y1="100" x2="240" y2="100" stroke="var(--fg-faint)" strokeWidth="1" strokeDasharray="4 4"/>
                  <line x1="40" y1="100" x2="240" y2={y2} stroke="var(--accent)" strokeWidth="2.5"/>
                  <line x1="240" y1="100" x2="240" y2={y2} stroke="var(--fg-faint)" strokeWidth="1" strokeDasharray="4 4"/>
                  <text x="140" y="115" fill="var(--fg-muted)" fontSize="11" fontFamily="Geist Mono" textAnchor="middle">run · {ru}{isImp ? '"' : ' cm'}</text>
                  <text x="248" y={(100 + y2) / 2 + 4} fill="var(--fg-muted)" fontSize="11" fontFamily="Geist Mono">{r}{isImp ? '"' : ' cm'}</text>
                </>
              );
            })()}
          </svg>
        </div>
      </div>
      <div className="subsection">
        <h3 className="subsection-title">Quick presets</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[[4,12,'Low'],[6,12,'Standard'],[9,12,'Steep'],[12,12,'45°']].map(([r, ru, label]) => (
            <button key={label} className="btn btn-secondary btn-sm" onClick={() => { setField('rise', r); setField('run', ru); }}>
              {r}/{ru} <span style={{ color: 'var(--fg-subtle)', marginLeft: 4 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
RoofPitchCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const k = from === 'imperial' && to === 'metric' ? 2.54 : (1/2.54);
  return {
    ...state,
    rise: +(state.rise * k).toFixed(1),
    run:  +(state.run * k).toFixed(1),
  };
};
RoofPitchCalculator.compute = function (state) {
  const rise = parseFloat(state.rise) || 0;
  const run = parseFloat(state.run) || 12;
  const ratio = rise / run;
  const degrees = Math.atan(ratio) * (180 / Math.PI);
  const percent = ratio * 100;
  // Normalize to /12
  const pitchOver12 = (rise * 12 / run);
  // IRC: <2/12 (≈9.5°) requires membrane roofing; 2/12–4/12 (≈9.5–18.4°) is conventional low-slope
  // with full ice-and-water shield; 4/12–9/12 (≈18.4–36.9°) is standard; ≥45° is very steep.
  const category = degrees < 9.5 ? 'Low-slope (membrane)'
    : degrees < 18.4 ? 'Conventional low-slope'
    : degrees < 36.9 ? 'Standard pitch'
    : degrees < 45 ? 'Steep'
    : 'Very steep';
  // Multiplier for surface area vs footprint
  const multiplier = Math.sqrt(1 + ratio * ratio);

  return {
    primary: { value: pitchOver12, decimals: 2, unit: '/ 12', label: 'Pitch (rise / 12 in run)' },
    sub: `That's ${F.dec(degrees, 1)}° of slope — ${category.toLowerCase()}. Roof surface area is ${F.dec(multiplier, 3)}× the building footprint.`,
    breakdown: [
      { label: 'Pitch ratio',      value: `${F.dec(pitchOver12, 2)} / 12` },
      { label: 'Angle (degrees)',  value: `${F.dec(degrees, 2)}°` },
      { label: 'Slope (percent)',  value: `${F.dec(percent, 1)}%` },
      { label: 'Area multiplier',  value: `×${F.dec(multiplier, 3)}` },
      { label: 'Classification',   value: category },
    ],
  };
};

// ============================================================
// BOARD FEET CALCULATOR
// ============================================================
function BoardFeetCalculator({ state, setField, units }) {
  const { thickness, width, length, qty } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Board dimensions</label>
        <div className="field-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <NI value={thickness} onChange={(v) => setField('thickness', v)} unit="in" min={0.25} max={12} step={0.25}/>
          <NI value={width} onChange={(v) => setField('width', v)} unit="in" min={0.5} max={48} step={0.25}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Thickness</span><span>Width</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Length</label>
        <NI value={length} onChange={(v) => setField('length', v)} unit="ft" min={1} max={50}/>
      </div>
      <div className="field">
        <label className="field-label">Quantity <span className="field-hint">number of identical boards</span></label>
        <NI value={qty} onChange={(v) => setField('qty', v)} unit="ea" min={1} max={500}/>
      </div>
      <div className="subsection">
        <h3 className="subsection-title">Common sizes</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: '1×4',  t: 1,    w: 4 },
            { label: '1×6',  t: 1,    w: 6 },
            { label: '2×4',  t: 2,    w: 4 },
            { label: '2×6',  t: 2,    w: 6 },
            { label: '2×8',  t: 2,    w: 8 },
            { label: '2×10', t: 2,    w: 10 },
            { label: '4/4 hardwood (1″ thick)', t: 1, w: 6 },
            { label: '8/4 hardwood (2″ thick)', t: 2, w: 6 },
          ].map(p => (
            <button key={p.label} className="btn btn-secondary btn-sm" onClick={() => { setField('thickness', p.t); setField('width', p.w); }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
BoardFeetCalculator.compute = function (state) {
  const t = parseFloat(state.thickness) || 0;
  const w = parseFloat(state.width) || 0;
  const l = parseFloat(state.length) || 0;
  const q = parseInt(state.qty) || 1;
  const bf = (t * w * l) / 12;
  const total = bf * q;
  const linearFt = l * q;
  const cuFt = (t * w * (l * 12)) / 1728;
  return {
    primary: { value: total, decimals: 2, unit: 'board feet', label: 'Total board feet' },
    sub: `${q} board${q > 1 ? 's' : ''} of ${t}″ × ${w}″ × ${l}′ totals ${F.dec(total, 2)} bf. Hardwood is priced this way; softwood is usually priced per linear foot.`,
    breakdown: [
      { label: 'Per board',     value: `${F.dec(bf, 3)} bf` },
      { label: 'Quantity',      value: `${q}` },
      { label: 'Total bf',      value: `${F.dec(total, 2)} bf` },
      { label: 'Linear feet',   value: `${F.dec(linearFt, 1)} lf` },
      { label: 'Cubic feet',    value: `${F.dec(cuFt * q, 2)} ft³` },
    ],
  };
};
BoardFeetCalculator.imperialOnly = true;

// ============================================================
// MULCH CALCULATOR
// ============================================================
function MulchCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { shape, length, width, diameter, depth } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Bed shape</label>
        <div className="shape-options">
          <button className={`shape-option ${shape === 'rect' ? 'active' : ''}`} onClick={() => setField('shape', 'rect')}>
            <Icons.Rectangle size={22}/><span>Rectangle</span>
          </button>
          <button className={`shape-option ${shape === 'circle' ? 'active' : ''}`} onClick={() => setField('shape', 'circle')}>
            <Icons.Circle size={22}/><span>Circle</span>
          </button>
          <button className={`shape-option ${shape === 'triangle' ? 'active' : ''}`} onClick={() => setField('shape', 'triangle')}>
            <Icons.Triangle size={22}/><span>Triangle</span>
          </button>
        </div>
      </div>
      {shape === 'circle' ? (
        <div className="field">
          <label className="field-label">Diameter</label>
          <NI value={diameter} onChange={(v) => setField('diameter', v)} unit={isImp ? 'ft' : 'm'} min={1} max={100}/>
        </div>
      ) : (
        <div className="field">
          <label className="field-label">Bed dimensions</label>
          <div className="field-row">
            <NI value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={1} max={500}/>
            <NI value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={1} max={500}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
            <span>{shape === 'triangle' ? 'Base' : 'Length'}</span>
            <span>{shape === 'triangle' ? 'Height' : 'Width'}</span>
          </div>
        </div>
      )}
      <div className="field">
        <label className="field-label">Depth <span className="field-hint">{isImp ? '3" recommended for mulch' : '8 cm recommended for mulch'}</span></label>
        <SL
          value={depth}
          onChange={(v) => setField('depth', v)}
          min={isImp ? 1 : 2}
          max={isImp ? 8 : 20}
          step={isImp ? 0.5 : 1}
          format={v => isImp ? `${v}"` : `${v} cm`}
        />
      </div>
    </>
  );
}
MulchCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return {
    ...state,
    length: +(state.length * k).toFixed(dec),
    width:  +(state.width * k).toFixed(dec),
    diameter: +(state.diameter * k).toFixed(dec),
    depth: from === 'imperial' && to === 'metric'
      ? Math.max(2, Math.round((state.depth || 3) * 2.54))
      : Math.max(1, +((state.depth || 8) / 2.54).toFixed(1)),
  };
};
MulchCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const { shape, length, width, diameter, depth } = state;
  let area;
  if (shape === 'circle') area = Math.PI * Math.pow(toFt(diameter, isImp) / 2, 2);
  else if (shape === 'triangle') area = 0.5 * toFt(length, isImp) * toFt(width, isImp);
  else area = toFt(length, isImp) * toFt(width, isImp);
  const depthFt = isImp ? (depth || 3) / 12 : (depth || 8) / 100 * 3.28084;
  const cuFt = area * depthFt;
  const cuYd = cuFt / 27;
  const cuM = cuFt * 0.0283168;
  const bags2 = Math.ceil(cuFt / 2);     // 2 cu ft = 56.6 L bag
  const bags50L = Math.ceil((cuM * 1000) / 50);
  const sqM = area * 0.092903;
  return {
    primary: { value: isImp ? cuYd : cuM, decimals: isImp ? 2 : 3, unit: isImp ? 'cubic yards' : 'm³', label: 'Mulch you need' },
    sub: isImp
      ? `Or ${bags2} bags of standard 2 cu ft mulch. Bulk mulch is cheaper above 3 yards — most landscape suppliers will deliver for a flat fee.`
      : `Or ${bags50L} bags of standard 50 L mulch. Bulk mulch is cheaper above 2 m³ — most landscape suppliers will deliver for a flat fee.`,
    breakdown: isImp ? [
      { label: 'Bed area',     value: `${F.dec(area, 1)} sq ft` },
      { label: 'Depth',        value: `${depth}"` },
      { label: 'Volume',       value: `${F.dec(cuFt, 2)} ft³` },
      { label: 'Cubic yards',  value: `${F.dec(cuYd, 2)} yd³` },
      { label: 'Bags (2 ft³)', value: `${bags2}` },
    ] : [
      { label: 'Bed area',     value: `${F.dec(sqM, 2)} m²` },
      { label: 'Depth',        value: `${depth} cm` },
      { label: 'Volume',       value: `${F.dec(cuM, 3)} m³` },
      { label: 'Cubic yards',  value: `${F.dec(cuYd, 2)} yd³` },
      { label: 'Bags (50 L)',  value: `${bags50L}` },
    ],
  };
};

// ============================================================
// STAIR STRINGER CALCULATOR
// ============================================================
function StairStringerCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { totalRise, riserHeight } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Total rise <span className="field-hint">floor to floor</span></label>
        <NI value={totalRise} onChange={(v) => setField('totalRise', v)} unit={isImp ? 'in' : 'cm'} min={4} max={300}/>
      </div>
      <div className="field">
        <label className="field-label">Target riser height <span className="field-hint">code max: 7.75"</span></label>
        <SL value={riserHeight} onChange={(v) => setField('riserHeight', v)} min={5} max={8} step={0.125} format={v => `${v}"`}/>
      </div>
      <div className="subsection">
        <h3 className="subsection-title">Code reference</h3>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.7 }}>
          <div>Max riser: <span className="mono" style={{ color: 'var(--fg)' }}>7.75″</span></div>
          <div>Min tread: <span className="mono" style={{ color: 'var(--fg)' }}>10″</span></div>
          <div>Variation between risers: <span className="mono" style={{ color: 'var(--fg)' }}>≤ 3/8″</span></div>
        </div>
      </div>
    </>
  );
}
StairStringerCalculator.imperialOnly = true;
StairStringerCalculator.compute = function (state) {
  const rise = parseFloat(state.totalRise) || 0;
  const target = parseFloat(state.riserHeight) || 7;
  const numRisers = Math.max(1, Math.round(rise / target));
  const actualRiser = numRisers > 0 ? rise / numRisers : 0;
  const numTreads = numRisers - 1;
  const tread = 10.5; // typical tread depth
  const totalRun = numTreads * tread;
  const angle = totalRun > 0 ? Math.atan(rise / totalRun) * (180 / Math.PI) : 0;
  const stringerLength = Math.sqrt(rise * rise + totalRun * totalRun);
  const exceedsCode = actualRiser > 7.75;
  const tooShort = actualRiser < 4 && rise > 0;
  const codeNote = exceedsCode
    ? ` ⚠ Actual riser ${F.dec(actualRiser, 2)}″ exceeds the 7.75″ IRC max. Lower your target riser height to add a step.`
    : tooShort
    ? ` ⚠ Actual riser ${F.dec(actualRiser, 2)}″ is below 4″ — most codes require at least 4″. Raise your target.`
    : '';

  return {
    primary: { value: numRisers, decimals: 0, unit: 'risers', label: 'You need this many' },
    sub: `${numRisers} risers at ${F.dec(actualRiser, 3)}″ and ${numTreads} treads at 10.5″ gives you a ${F.dec(angle, 1)}° staircase.${codeNote}`,
    breakdown: [
      { label: 'Number of risers', value: `${numRisers}` },
      { label: 'Actual riser height', value: `${F.dec(actualRiser, 3)}″${exceedsCode ? ' ⚠' : ''}` },
      { label: 'Number of treads', value: `${numTreads}` },
      { label: 'Total run', value: `${F.dec(totalRun, 1)}″` },
      { label: 'Stringer length', value: `${F.dec(stringerLength, 1)}″` },
      { label: 'Angle', value: `${F.dec(angle, 1)}°` },
    ],
  };
};

// ============================================================
// GRAVEL CALCULATOR
// ============================================================
function GravelCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { length, width, depth, gravelType } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Area dimensions</label>
        <div className="field-row">
          <NI value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={1} max={500}/>
          <NI value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={1} max={500}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Depth</label>
        <SL
          value={depth}
          onChange={(v) => setField('depth', v)}
          min={isImp ? 1 : 2}
          max={isImp ? 12 : 30}
          step={isImp ? 0.5 : 1}
          format={v => isImp ? `${v}"` : `${v} cm`}
        />
      </div>
      <div className="field">
        <label className="field-label">Gravel type</label>
        <PT
          options={[
            { label: 'Pea', value: 'pea' },
            { label: 'Crushed', value: 'crushed' },
            { label: 'River', value: 'river' },
          ]}
          value={gravelType}
          onChange={(v) => setField('gravelType', v)}
        />
      </div>
    </>
  );
}
GravelCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return {
    ...state,
    length: +(state.length * k).toFixed(dec),
    width:  +(state.width * k).toFixed(dec),
    depth: from === 'imperial' && to === 'metric'
      ? Math.max(2, Math.round((state.depth || 4) * 2.54))
      : Math.max(1, +((state.depth || 10) / 2.54).toFixed(1)),
  };
};
GravelCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const { length, width, depth, gravelType } = state;
  const area = toFt(length, isImp) * toFt(width, isImp);
  const depthFt = isImp ? (depth || 4) / 12 : (depth || 10) / 100 * 3.28084;
  const cuFt = area * depthFt;
  const cuYd = cuFt / 27;
  const cuM = cuFt * 0.0283168;
  // US tons per cubic yard — pea ~1.4, crushed ~1.5, river ~1.5
  const density = { pea: 1.4, crushed: 1.5, river: 1.5 }[gravelType] || 1.5;
  const tons = cuYd * density;
  const tonnes = tons * 0.907185;
  const sqM = area * 0.092903;
  return {
    primary: { value: isImp ? cuYd : cuM, decimals: isImp ? 2 : 3, unit: isImp ? 'cubic yards' : 'm³', label: 'Gravel volume' },
    sub: isImp
      ? `That's about ${F.dec(tons, 2)} tons of ${gravelType} gravel. Most yards deliver by the ton — round up by 10% for spreading and settling.`
      : `That's about ${F.dec(tonnes, 2)} tonnes of ${gravelType} gravel. Most yards deliver by weight — round up by 10% for spreading and settling.`,
    breakdown: isImp ? [
      { label: 'Surface area',   value: `${F.dec(area, 1)} sq ft` },
      { label: 'Depth',          value: `${depth}"` },
      { label: 'Volume',         value: `${F.dec(cuFt, 2)} ft³` },
      { label: 'Cubic yards',    value: `${F.dec(cuYd, 2)} yd³` },
      { label: 'Estimated tons', value: `${F.dec(tons, 2)} tons` },
    ] : [
      { label: 'Surface area',     value: `${F.dec(sqM, 2)} m²` },
      { label: 'Depth',            value: `${depth} cm` },
      { label: 'Volume',           value: `${F.dec(cuM, 3)} m³` },
      { label: 'Estimated tonnes', value: `${F.dec(tonnes, 2)} t` },
    ],
  };
};

// ============================================================
// SQUARE FOOTAGE (multi-shape)
// ============================================================
function SquareFootageCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { shapes } = state;
  const addShape = (type) => {
    setField('shapes', [...shapes, { id: Date.now(), type, length: 10, width: 10, diameter: 6 }]);
  };
  const updateShape = (id, key, value) => {
    setField('shapes', shapes.map(s => s.id === id ? { ...s, [key]: value } : s));
  };
  const removeShape = (id) => {
    setField('shapes', shapes.filter(s => s.id !== id));
  };
  return (
    <>
      <div className="field" style={{ marginTop: 0 }}>
        <label className="field-label">Add a section <span className="field-hint">combine multiple shapes</span></label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => addShape('rect')}>
            <Icons.Plus size={12}/> Rectangle
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => addShape('circle')}>
            <Icons.Plus size={12}/> Circle
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => addShape('triangle')}>
            <Icons.Plus size={12}/> Triangle
          </button>
        </div>
      </div>
      <div className="subsection" style={{ marginTop: 24 }}>
        <h3 className="subsection-title">Sections ({shapes.length})</h3>
        {shapes.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--fg-subtle)', textAlign: 'center', padding: '24px 0', border: '1px dashed var(--border)', borderRadius: 8 }}>
            Add a shape above to start.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {shapes.map((s, idx) => (
              <div key={s.id} style={{ padding: 16, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
                    {s.type === 'rect' ? <Icons.Rectangle size={14}/> : s.type === 'circle' ? <Icons.Circle size={14}/> : <Icons.Triangle size={14}/>}
                    Section {idx + 1} — {s.type === 'rect' ? 'Rectangle' : s.type === 'circle' ? 'Circle' : 'Triangle'}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeShape(s.id)} style={{ height: 24, padding: '0 8px', fontSize: 11.5 }}>Remove</button>
                </div>
                {s.type === 'circle' ? (
                  <NI value={s.diameter} onChange={(v) => updateShape(s.id, 'diameter', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={500}/>
                ) : (
                  <div className="field-row">
                    <NI value={s.length} onChange={(v) => updateShape(s.id, 'length', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={500}/>
                    <NI value={s.width} onChange={(v) => updateShape(s.id, 'width', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={500}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
SquareFootageCalculator.convertState = function (state, from, to) {
  if (from === to) return state;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return {
    ...state,
    shapes: state.shapes.map(s => ({
      ...s,
      length: +(s.length * k).toFixed(dec),
      width:  +(s.width * k).toFixed(dec),
      diameter: +(s.diameter * k).toFixed(dec),
    })),
  };
};
SquareFootageCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const { shapes } = state;
  let total = 0;
  const rows = [];
  shapes.forEach((s, i) => {
    let a;
    if (s.type === 'circle') a = Math.PI * Math.pow(toFt(s.diameter, isImp) / 2, 2);
    else if (s.type === 'triangle') a = 0.5 * toFt(s.length, isImp) * toFt(s.width, isImp);
    else a = toFt(s.length, isImp) * toFt(s.width, isImp);
    total += a;
    const display = isImp ? `${F.dec(a, 1)} sq ft` : `${F.dec(a * 0.092903, 2)} m²`;
    rows.push({ label: `Section ${i + 1} (${s.type})`, value: display });
  });
  const sqM = total * 0.092903;
  const acres = total / 43560;
  const hectares = sqM / 10000;
  return {
    primary: { value: isImp ? total : sqM, decimals: isImp ? 1 : 2, unit: isImp ? 'sq ft' : 'm²', label: 'Total area' },
    sub: shapes.length === 0
      ? 'Add sections above to compute total area.'
      : isImp
      ? `Across ${shapes.length} section${shapes.length > 1 ? 's' : ''} — that's ${F.dec(sqM, 1)} m² or ${F.dec(acres, 4)} acres.`
      : `Across ${shapes.length} section${shapes.length > 1 ? 's' : ''} — that's ${F.dec(total, 0)} sq ft or ${F.dec(hectares, 4)} hectares.`,
    breakdown: rows.length === 0
      ? [{ label: 'No sections yet', value: '—' }]
      : [...rows, { label: 'Total', value: isImp ? `${F.dec(total, 1)} sq ft` : `${F.dec(sqM, 2)} m²` }],
  };
};

// ============================================================
// REGISTER
// ============================================================
Object.assign(window.Calcs, {
  'tile-boxes': {
    Component: TileCalculator,
    initial: { length: 10, width: 8, tilePerBox: 10, waste: 10, pattern: 'straight' },
    title: 'Tile Box Calculator',
    subtitle: 'Boxes of tile needed for any floor, wall, or backsplash — adjustable waste factor.',
    category: 'tile',
    formula: [
      ['area',          '= L × W'],
      ['with waste',    '= area × (1 + waste %)'],
      ['boxes',         '= ceil(adjusted ÷ coverage per box)'],
    ],
    howWorks: `Tile is sold by the box and each box covers a known number of square feet — usually printed on the carton. We compute your surface area, add a waste factor for cuts and breakage, then divide by box coverage and round up. Straight layouts need about 10% waste, diagonal layouts 15%, and herringbone or mosaic patterns 20% or more. Keep one full box from the same dye lot for future repairs — manufacturers' color batches shift over time.`,
  },
  'roof-pitch': {
    Component: RoofPitchCalculator,
    initial: { rise: 6, run: 12 },
    title: 'Roof Pitch Calculator',
    subtitle: 'Convert any rise-over-run into pitch ratio, degrees of slope, and area multiplier.',
    category: 'roofing',
    formula: [
      ['pitch ratio',     '= rise ÷ run × 12'],
      ['angle (deg)',     '= arctan(rise ÷ run)'],
      ['slope %',         '= (rise ÷ run) × 100'],
      ['area multiplier', '= √(1 + (rise ÷ run)²)'],
    ],
    howWorks: `Roof pitch is the steepness of a roof, usually expressed as inches of rise per 12 inches of horizontal run. A 6/12 pitch means the roof rises 6 inches for every 12 inches of horizontal distance, equal to about 26.6°. We compute the pitch in three common forms: the /12 ratio that roofers use, the angle in degrees, and the slope percentage. The area multiplier tells you how much more roof surface there is than the footprint below — useful when ordering shingles, underlayment, or estimating labor.`,
  },
  'board-feet': {
    Component: BoardFeetCalculator,
    initial: { thickness: 2, width: 4, length: 8, qty: 10 },
    title: 'Board Feet Calculator',
    subtitle: 'Total board feet for any thickness, width, and length — the hardwood pricing unit.',
    category: 'lumber',
    formula: [
      ['per board', '= (T × W × L) ÷ 12'],
      ['total',     '= per board × quantity'],
      ['',          '(T, W in inches; L in feet)'],
    ],
    howWorks: `A board foot is 144 cubic inches of wood — a piece 1 inch thick, 12 inches wide, and 1 foot long. Hardwoods and rough lumber are usually priced per board foot, while dimensional softwoods are typically sold per linear foot. To compute it: multiply thickness in inches × width in inches × length in feet, then divide by 12. Lumber thickness is also sold in quarters: 4/4 ("four-quarter") is one inch thick, 8/4 is two inches, and so on.`,
  },
  'mulch': {
    Component: MulchCalculator,
    initial: { shape: 'rect', length: 20, width: 6, diameter: 10, depth: 3 },
    title: 'Mulch Calculator',
    subtitle: 'Cubic yards and bag counts for garden beds at any depth.',
    category: 'landscape',
    formula: [
      ['area',         '= L × W (or πr² for circles)'],
      ['volume (ft³)', '= area × (depth ÷ 12)'],
      ['cubic yards',  '= volume ÷ 27'],
      ['bags (2 ft³)', '= ceil(volume ÷ 2)'],
    ],
    howWorks: `Mulch keeps moisture in, weeds out, and soil temperature steady. Three inches is the sweet spot for most beds — any thicker and you risk root rot or pests bedding down for the season. We compute the volume of your bed, then offer it two ways: by the cubic yard for bulk delivery (typically cheaper above 3 yards) and by the 2-cubic-foot bag for smaller jobs. Bulk mulch is usually delivered loose and dumped at your driveway; bag mulch is easier to carry through gates but adds up fast.`,
  },
  'stair-stringer': {
    Component: StairStringerCalculator,
    initial: { totalRise: 108, riserHeight: 7.5 },
    title: 'Stair Stringer Calculator',
    subtitle: 'Total rise, riser count, tread depth, and stringer length for a code-compliant staircase.',
    category: 'lumber',
    formula: [
      ['risers',          '= round(total rise ÷ target)'],
      ['actual riser',    '= total rise ÷ risers'],
      ['treads',          '= risers − 1'],
      ['total run',       '= treads × tread depth'],
      ['stringer length', '= √(rise² + run²)'],
    ],
    howWorks: `A stringer is the diagonal board that supports each step. To lay one out: measure the total vertical rise from finished floor to finished floor, divide by a target riser height (7 to 7.75 inches is typical), and round to the nearest whole number. That's your riser count — risers minus one is the tread count. Multiply tread depth (10 to 11 inches) by tread count to get the total run. The hypotenuse of rise and run is your stringer length, plus a few inches for the connection at the top and bottom. Codes vary by jurisdiction — verify locally before cutting.`,
  },
  'gravel': {
    Component: GravelCalculator,
    initial: { length: 20, width: 10, depth: 4, gravelType: 'crushed' },
    title: 'Gravel Calculator',
    subtitle: 'Cubic yards and tons of gravel for driveways, paths, and drainage.',
    category: 'landscape',
    formula: [
      ['volume (ft³)', '= L × W × (depth ÷ 12)'],
      ['cubic yards',  '= volume ÷ 27'],
      ['tons',         '= cubic yards × density'],
      ['',             '(density: pea 1.4, crushed 1.5)'],
    ],
    howWorks: `Gravel is sold by the cubic yard for delivery and by the ton at the scale. Driveways need 4 to 6 inches over a compacted base; garden paths get by with 2 to 3 inches. Pea gravel is rounded and looks great but rolls underfoot; crushed gravel locks together into a firmer surface and stays put. Most landscape suppliers will deliver a half-yard or more — call before ordering, because cubic-yard pricing usually beats per-bag pricing by a wide margin once you're past one yard.`,
  },
  'square-footage': {
    Component: SquareFootageCalculator,
    initial: { shapes: [{ id: 'init-1', type: 'rect', length: 12, width: 10, diameter: 6 }] },
    title: 'Square Footage Calculator',
    subtitle: 'Compute total area for rooms or yards made of multiple rectangles, circles, and triangles.',
    category: 'paint',
    formula: [
      ['rectangle', '= L × W'],
      ['circle',    '= π × (D ÷ 2)²'],
      ['triangle',  '= ½ × base × height'],
      ['total',     '= sum of all sections'],
    ],
    howWorks: `Many spaces aren't simple rectangles — an L-shaped room, a yard with a round flower bed, a kitchen with a peninsula. Break the space into rectangles, circles, and triangles, compute each one separately, and add them up. That's what this calculator does. For curves that aren't circles, approximate with a few triangles — even a rough breakdown gets you within 5% of the true area. The result is useful for paint, flooring, sod, fertilizer, anything sold by area.`,
  },
});
