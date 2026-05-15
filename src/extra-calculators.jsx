// Additional calculators to fill out thin categories.
// Concrete: footing/pier ▸ Drywall: finishing materials ▸ Tile: grout & thinset
// Roofing: shingle bundles ▸ Lumber: deck boards ▸ Landscape: sod ▸ Paint: trim & ceiling
const { NumberInput: XNI, PillToggle: XPT, Slider: XSL, fmt: XF } = window.Primitives;
const toFt3 = (v, isImp) => isImp ? v : (v || 0) * 3.28084;

// ============================================================
// FOOTING & PIER — concrete pier or rectangular footing
// ============================================================
function FootingPierCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { type, diameter, length, width, height, qty } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Type</label>
        <div className="shape-options">
          <button className={`shape-option ${type === 'tube' ? 'active' : ''}`} onClick={() => setField('type', 'tube')}>
            <Icons.Circle size={22}/><span>Sonotube</span>
          </button>
          <button className={`shape-option ${type === 'footing' ? 'active' : ''}`} onClick={() => setField('type', 'footing')}>
            <Icons.Rectangle size={22}/><span>Rect. footing</span>
          </button>
        </div>
      </div>

      {type === 'tube' ? (
        <div className="field">
          <label className="field-label">Diameter <span className="field-hint">{isImp ? 'inches' : 'cm'}</span></label>
          <XNI value={diameter} onChange={(v) => setField('diameter', v)} unit={isImp ? 'in' : 'cm'} min={6} max={36}/>
        </div>
      ) : (
        <div className="field">
          <label className="field-label">Footprint <span className="field-hint">{isImp ? 'feet' : 'meters'}</span></label>
          <div className="field-row">
            <XNI value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={50}/>
            <XNI value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={50}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
            <span>Length</span><span>Width</span>
          </div>
        </div>
      )}

      <div className="field">
        <label className="field-label">Depth / height <span className="field-hint">below grade for footings</span></label>
        <XNI value={height} onChange={(v) => setField('height', v)} unit={isImp ? 'ft' : 'm'} min={0.5} max={20}/>
      </div>

      <div className="field">
        <label className="field-label">Quantity <span className="field-hint">identical units</span></label>
        <XNI value={qty} onChange={(v) => setField('qty', v)} unit="ea" min={1} max={200}/>
      </div>

      <div className="subsection">
        <h3 className="subsection-title">Common sizes</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['8" deck pier', 'tube', 8, 4], ['10" pier', 'tube', 10, 4], ['12" pier', 'tube', 12, 4], ['16" pier', 'tube', 16, 4]].map(([label, t, d, h]) => (
            <button key={label} className="btn btn-secondary btn-sm" onClick={() => { setField('type', t); setField('diameter', d); setField('height', h); }}>{label}</button>
          ))}
        </div>
      </div>
    </>
  );
}
FootingPierCalculator.convertState = function (s, from, to) {
  if (from === to) return s;
  const m2ft = 3.28084, ft2m = 0.3048;
  if (from === 'imperial' && to === 'metric') return {
    ...s,
    diameter: +((s.diameter || 0) * 2.54).toFixed(1),
    length: +(s.length * ft2m).toFixed(2),
    width: +(s.width * ft2m).toFixed(2),
    height: +(s.height * ft2m).toFixed(2),
  };
  return {
    ...s,
    diameter: +((s.diameter || 0) / 2.54).toFixed(1),
    length: +(s.length * m2ft).toFixed(1),
    width: +(s.width * m2ft).toFixed(1),
    height: +(s.height * m2ft).toFixed(1),
  };
};
FootingPierCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const { type, diameter, length, width, height, qty } = state;
  const H = toFt3(height, isImp);
  let areaFt;
  if (type === 'tube') {
    const dFt = isImp ? (diameter || 0) / 12 : (diameter || 0) / 100 * 3.28084;
    areaFt = Math.PI * Math.pow(dFt / 2, 2);
  } else {
    areaFt = toFt3(length, isImp) * toFt3(width, isImp);
  }
  const cuFtEach = areaFt * H;
  const cuFt = cuFtEach * (qty || 1);
  const cuYd = cuFt / 27;
  const cuM = cuFt * 0.0283168;
  const cuMEach = cuFtEach * 0.0283168;
  const bags60 = Math.ceil(cuFt / 0.45);
  const bags80 = Math.ceil(cuFt / 0.60);
  const noun = type === 'tube' ? 'pier' : 'footing';
  return {
    primary: {
      value: isImp ? cuYd : cuM,
      decimals: 3,
      unit: isImp ? 'cubic yards' : 'm³',
      label: 'Concrete needed',
    },
    sub: isImp
      ? `${qty} ${noun}${qty > 1 ? 's' : ''} at ${XF.dec(cuFtEach, 2)} ft³ each. Most pours under ½ yd³ are cheapest with bagged concrete.`
      : `${qty} ${noun}${qty > 1 ? 's' : ''} at ${XF.dec(cuMEach, 3)} m³ each. Most pours under 0.4 m³ are cheapest with bagged concrete.`,
    breakdown: isImp ? [
      { label: 'Volume per unit', value: `${XF.dec(cuFtEach, 2)} ft³` },
      { label: 'Total volume',    value: `${XF.dec(cuFt, 2)} ft³` },
      { label: 'Cubic yards',     value: `${XF.dec(cuYd, 3)} yd³` },
      { label: '60 lb bags',      value: `${bags60} bags` },
      { label: '80 lb bags',      value: `${bags80} bags` },
    ] : [
      { label: 'Volume per unit',     value: `${XF.dec(cuMEach, 3)} m³` },
      { label: 'Total volume',        value: `${XF.dec(cuM, 3)} m³` },
      { label: '60 lb (27 kg) bags',  value: `${bags60} bags` },
      { label: '80 lb (36 kg) bags',  value: `${bags80} bags` },
    ],
  };
};

// ============================================================
// DRYWALL FINISHING — mud, tape & screws from a square footage
// ============================================================
function DrywallFinishingCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { area, joints } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Drywall area <span className="field-hint">{isImp ? 'square feet installed' : 'square meters'}</span></label>
        <XNI value={area} onChange={(v) => setField('area', v)} unit={isImp ? 'sf' : 'm²'} min={1} max={isImp ? 50000 : 5000}/>
      </div>
      <div className="field">
        <label className="field-label">Joint complexity</label>
        <XPT
          options={[
            { label: 'Light', value: 'light' },
            { label: 'Standard', value: 'standard' },
            { label: 'Heavy', value: 'heavy' },
          ]}
          value={joints}
          onChange={(v) => setField('joints', v)}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-subtle)' }}>
          {joints === 'light' && 'Few seams, mostly large sheets. Closets, small rooms.'}
          {joints === 'standard' && 'Typical room with average corners and butt joints.'}
          {joints === 'heavy' && 'Vaulted ceilings, lots of cut-ins, soffits, or skim coat.'}
        </div>
      </div>
      <div className="subsection">
        <h3 className="subsection-title">Quick rooms</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['Closet', 200], ['Bedroom', 600], ['Living room', 1200], ['Basement', 2400], ['Whole floor', 5000]].map(([label, a]) => (
            <button key={label} className="btn btn-secondary btn-sm" onClick={() => setField('area', isImp ? a : Math.round(a * 0.092903))}>{label}</button>
          ))}
        </div>
      </div>
    </>
  );
}
DrywallFinishingCalculator.convertState = function (s, from, to) {
  if (from === to) return s;
  if (from === 'imperial' && to === 'metric') return { ...s, area: +(s.area * 0.092903).toFixed(1) };
  return { ...s, area: Math.round(s.area / 0.092903) };
};
DrywallFinishingCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const sf = isImp ? (state.area || 0) : (state.area || 0) * 10.7639;
  const mult = { light: 0.85, standard: 1.0, heavy: 1.25 }[state.joints] || 1.0;
  // USG / Sheetrock 3-coat reference: ~14 gal compound, ~330 lf paper tape per 1,000 sq ft.
  const mudGal = Math.ceil(sf * 0.014 * mult * 10) / 10;
  const buckets = Math.ceil(mudGal / 4.5);                  // 4.5 gal pre-mix bucket
  const tapeLf = Math.ceil(sf * 0.33 * mult);
  const tapeRolls = Math.ceil(tapeLf / 250);                // 250 lf rolls
  // Screws: ~1 per sq ft on walls (16" o.c.), ~1.5 on ceilings (12" o.c.). Average without
  // a wall/ceiling split here; use 1.1/sf as a balanced estimate.
  const screws = Math.ceil(sf * 1.1 * mult);
  const screwLbs = Math.ceil(screws / 250 * 10) / 10;       // ~250 screws/lb for #6 × 1¼" coarse
  return {
    primary: { value: buckets, decimals: 0, unit: buckets === 1 ? 'bucket' : 'buckets', label: 'Joint compound (4.5 gal pre-mix)' },
    sub: `${XF.dec(mudGal, 1)} gallons total, plus ${tapeRolls} roll${tapeRolls > 1 ? 's' : ''} of paper tape and about ${XF.dec(screwLbs, 1)} lbs of screws.`,
    breakdown: [
      { label: 'Drywall area',     value: `${XF.int(sf)} sq ft` },
      { label: 'Joint compound',   value: `${XF.dec(mudGal, 1)} gal` },
      { label: 'Pre-mix buckets',  value: `${buckets}` },
      { label: 'Paper tape',       value: `${XF.int(tapeLf)} lf` },
      { label: 'Tape rolls (250lf)', value: `${tapeRolls}` },
      { label: 'Screws (~)',       value: `${XF.int(screws)} (${XF.dec(screwLbs, 1)} lb)` },
    ],
  };
};

// ============================================================
// GROUT & THINSET — from area + tile size + joint width
// ============================================================
function GroutThinsetCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { area, tileSize, jointWidth, thickness } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Tile area <span className="field-hint">{isImp ? 'square feet' : 'square meters'}</span></label>
        <XNI value={area} onChange={(v) => setField('area', v)} unit={isImp ? 'sf' : 'm²'} min={1} max={10000}/>
      </div>
      <div className="field">
        <label className="field-label">Tile size</label>
        <XPT
          options={[
            { label: '4"', value: 4 },
            { label: '6"', value: 6 },
            { label: '12"', value: 12 },
            { label: '18"', value: 18 },
            { label: '24"', value: 24 },
          ]}
          value={tileSize}
          onChange={(v) => setField('tileSize', v)}
        />
      </div>
      <div className="field">
        <label className="field-label">Grout joint width</label>
        <XSL value={jointWidth} onChange={(v) => setField('jointWidth', v)} min={1/16} max={1/2} step={1/16} format={v => `${(v * 16).toFixed(0)}/16"`}/>
      </div>
      <div className="field">
        <label className="field-label">Tile thickness <span className="field-hint">affects thinset coverage</span></label>
        <XPT
          options={[
            { label: 'Thin (≤ 3/8")', value: 'thin' },
            { label: 'Standard (1/2")', value: 'standard' },
            { label: 'Thick (≥ 5/8")', value: 'thick' },
          ]}
          value={thickness}
          onChange={(v) => setField('thickness', v)}
        />
      </div>
    </>
  );
}
GroutThinsetCalculator.imperialOnly = true;
GroutThinsetCalculator.compute = function (state) {
  const sf = parseFloat(state.area) || 0;
  const T = parseFloat(state.tileSize) || 12;
  const J = parseFloat(state.jointWidth) || 0.125;
  const thickFactor = { thin: 0.85, standard: 1.0, thick: 1.25 }[state.thickness] || 1.0;
  // Joint volume per sq ft ≈ (perimeter ÷ 2) × joint width × joint depth, summed across tiles in 1 sf.
  // Tiles per sf = 144 ÷ T². Per tile contributes (4T ÷ 2) × J × depth = 2T·J·depth in³.
  // Per sf volume = (144 ÷ T²) × 2T·J·depth = 288·J·depth ÷ T cubic inches per sq ft.
  // Conversion to lbs of DRY mix: a 25 lb bag of sanded grout covers ~130 sf of 12" tile @ 1/8" joint
  // × 1/2" depth (Custom Building Products, Mapei coverage charts), which yields ~195 in³ wet grout.
  // That implies ~0.128 lb dry mix per in³ of finished grout. We use 0.13 as the working density.
  const tileHeight = state.thickness === 'thin' ? 0.25 : state.thickness === 'thick' ? 0.625 : 0.5;
  const groutVolPerSf = (288 * J * tileHeight) / T;        // in³ of grout per sq ft
  const groutLbsPerSf = groutVolPerSf * 0.13;              // dry mix lbs per sq ft
  const totalLbs = sf * groutLbsPerSf * 1.10;              // +10% safety margin
  const bags25 = Math.max(1, Math.ceil(totalLbs / 25));
  // Thinset: 50 lb bag covers ~95 sf for 4-6" tile, ~80 sf for 12", ~60 sf for 18"+ (TCNA/Mapei).
  const thinsetCoverage = T <= 6 ? 95 : T <= 12 ? 80 : 60;
  const bagsThinset = Math.max(1, Math.ceil(sf * thickFactor * 1.10 / thinsetCoverage));
  return {
    primary: { value: bagsThinset, decimals: 0, unit: bagsThinset === 1 ? 'bag' : 'bags', label: 'Thinset (50 lb bags)' },
    sub: `Plus ${bags25} bag${bags25 > 1 ? 's' : ''} of grout — ${XF.dec(totalLbs, 1)} lbs total for a ${(J * 16).toFixed(0)}/16" joint. Both numbers include a 10% safety margin.`,
    breakdown: [
      { label: 'Tile area',            value: `${XF.int(sf)} sq ft` },
      { label: 'Tile size',            value: `${T}" × ${T}"` },
      { label: 'Joint width',          value: `${(J * 16).toFixed(0)}/16"` },
      { label: 'Grout (dry, +10%)',    value: `${XF.dec(totalLbs, 1)} lbs` },
      { label: 'Grout bags (25 lb)',   value: `${bags25}` },
      { label: 'Thinset bags (50 lb)', value: `${bagsThinset}` },
      { label: 'Thinset coverage',     value: `~${thinsetCoverage} sf/bag` },
    ],
  };
};

// ============================================================
// SHINGLE BUNDLES — from footprint + pitch
// ============================================================
function ShingleBundlesCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { length, width, pitch, ridgeLf, valleys } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Roof footprint <span className="field-hint">total area covered, viewed from above</span></label>
        <div className="field-row">
          <XNI value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={5} max={500}/>
          <XNI value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={5} max={500}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Roof pitch <span className="field-hint">rise over 12" run</span></label>
        <XPT
          options={[
            { label: '3/12', value: 3 },
            { label: '6/12', value: 6 },
            { label: '8/12', value: 8 },
            { label: '10/12', value: 10 },
            { label: '12/12', value: 12 },
          ]}
          value={pitch}
          onChange={(v) => setField('pitch', v)}
        />
      </div>
      <div className="field">
        <label className="field-label">Ridge & hip length <span className="field-hint">for cap shingles</span></label>
        <XNI value={ridgeLf} onChange={(v) => setField('ridgeLf', v)} unit={isImp ? 'lf' : 'm'} min={0} max={500}/>
      </div>
      <div className="field">
        <label className="field-label">Valleys</label>
        <XNI value={valleys} onChange={(v) => setField('valleys', v)} unit="ea" min={0} max={20}/>
      </div>
    </>
  );
}
ShingleBundlesCalculator.convertState = function (s, from, to) {
  if (from === to) return s;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return {
    ...s,
    length: +(s.length * k).toFixed(dec),
    width: +(s.width * k).toFixed(dec),
    ridgeLf: +(s.ridgeLf * k).toFixed(dec),
  };
};
ShingleBundlesCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const L = toFt3(state.length, isImp), W = toFt3(state.width, isImp);
  const footprint = L * W;
  const pitch = parseFloat(state.pitch) || 6;
  const mult = Math.sqrt(1 + Math.pow(pitch / 12, 2));
  const roofArea = footprint * mult;
  // Waste: 10% baseline, +2% per valley, +5% if 9/12 or steeper.
  const wastePct = 0.10 + (state.valleys || 0) * 0.02 + (pitch >= 9 ? 0.05 : 0);
  const areaWithWaste = roofArea * (1 + wastePct);
  const squares = areaWithWaste / 100;
  const bundles = Math.ceil(squares * 3);                    // 3 bundles / square (architectural)
  const ridgeLf = toFt3(state.ridgeLf, isImp);
  const capBundles = Math.ceil(ridgeLf / 33);                // ~33 lf per hip & ridge bundle
  const underlaymentRolls = Math.ceil(squares / 4);          // 4 squares per roll (synthetic)
  const sm = (sf) => sf * 0.092903;
  return {
    primary: { value: bundles, decimals: 0, unit: bundles === 1 ? 'bundle' : 'bundles', label: 'Shingles (3-tab / architectural)' },
    sub: isImp
      ? `That's ${XF.dec(squares, 1)} squares with ${(wastePct * 100).toFixed(0)}% waste. Plus ${capBundles} hip & ridge bundle${capBundles === 1 ? '' : 's'} and ${underlaymentRolls} roll${underlaymentRolls === 1 ? '' : 's'} of synthetic underlayment.`
      : `That's ${XF.dec(sm(areaWithWaste), 1)} m² of roof to cover (${(wastePct * 100).toFixed(0)}% waste). Plus ${capBundles} hip & ridge bundle${capBundles === 1 ? '' : 's'} and ${underlaymentRolls} roll${underlaymentRolls === 1 ? '' : 's'} of synthetic underlayment.`,
    breakdown: isImp ? [
      { label: 'Footprint',         value: `${XF.int(footprint)} sq ft` },
      { label: 'Pitch multiplier',  value: `×${XF.dec(mult, 3)}` },
      { label: 'Roof surface',      value: `${XF.int(roofArea)} sq ft` },
      { label: 'With waste',        value: `${XF.int(areaWithWaste)} sq ft` },
      { label: 'Squares',           value: `${XF.dec(squares, 2)}` },
      { label: 'Shingle bundles',   value: `${bundles}` },
      { label: 'Hip & ridge',       value: `${capBundles} bundle${capBundles === 1 ? '' : 's'}` },
      { label: 'Underlayment rolls',value: `${underlaymentRolls}` },
    ] : [
      { label: 'Footprint',         value: `${XF.dec(sm(footprint), 1)} m²` },
      { label: 'Pitch multiplier',  value: `×${XF.dec(mult, 3)}` },
      { label: 'Roof surface',      value: `${XF.dec(sm(roofArea), 1)} m²` },
      { label: 'With waste',        value: `${XF.dec(sm(areaWithWaste), 1)} m²` },
      { label: 'Squares (100 sf)',  value: `${XF.dec(squares, 2)}` },
      { label: 'Shingle bundles',   value: `${bundles}` },
      { label: 'Hip & ridge',       value: `${capBundles} bundle${capBundles === 1 ? '' : 's'}` },
      { label: 'Underlayment rolls',value: `${underlaymentRolls}` },
    ],
  };
};

// ============================================================
// DECK BOARDS — number of boards from deck size
// ============================================================
function DeckBoardsCalculator({ state, setField, units }) {
  const { length, width, boardWidth, boardLength, orientation, gap } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Deck dimensions <span className="field-hint">feet</span></label>
        <div className="field-row">
          <XNI value={length} onChange={(v) => setField('length', v)} unit="ft" min={2} max={100}/>
          <XNI value={width} onChange={(v) => setField('width', v)} unit="ft" min={2} max={100}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Board width</label>
        <XPT
          options={[
            { label: '5/4 × 6', value: 5.5 },
            { label: '2 × 4', value: 3.5 },
            { label: '2 × 6', value: 5.5 },
            { label: '2 × 8', value: 7.25 },
          ]}
          value={boardWidth}
          onChange={(v) => setField('boardWidth', v)}
        />
      </div>
      <div className="field">
        <label className="field-label">Board length <span className="field-hint">stock you'll order</span></label>
        <XPT
          options={[
            { label: '8\'', value: 8 },
            { label: '10\'', value: 10 },
            { label: '12\'', value: 12 },
            { label: '16\'', value: 16 },
          ]}
          value={boardLength}
          onChange={(v) => setField('boardLength', v)}
        />
      </div>
      <div className="field">
        <label className="field-label">Orientation <span className="field-hint">boards run...</span></label>
        <XPT
          options={[
            { label: 'Along length', value: 'length' },
            { label: 'Across width', value: 'width' },
          ]}
          value={orientation}
          onChange={(v) => setField('orientation', v)}
        />
      </div>
      <div className="field">
        <label className="field-label">Gap between boards</label>
        <XSL value={gap} onChange={(v) => setField('gap', v)} min={0} max={0.5} step={1/16} format={v => v === 0 ? 'tight' : `${(v * 16).toFixed(0)}/16"`}/>
      </div>
    </>
  );
}
DeckBoardsCalculator.imperialOnly = true;
DeckBoardsCalculator.compute = function (state) {
  const L = parseFloat(state.length) || 0;
  const W = parseFloat(state.width) || 0;
  const bw = parseFloat(state.boardWidth) || 5.5; // actual inches
  const bl = parseFloat(state.boardLength) || 12;
  const gap = parseFloat(state.gap) || 0.125;
  const runLengthFt = state.orientation === 'length' ? L : W;
  const perpFt = state.orientation === 'length' ? W : L;
  // Rows of boards across the perpendicular direction
  const rowsAcross = Math.ceil((perpFt * 12) / (bw + gap));
  // Each row needs runLengthFt of board; how many stock boards per row?
  const boardsPerRow = Math.ceil(runLengthFt / bl);
  const totalBoards = rowsAcross * boardsPerRow;
  const linearFt = totalBoards * bl;
  const totalSf = L * W;
  const waste = (linearFt * bw / 12) - totalSf;
  const wastePct = waste / totalSf * 100;
  // Screws: ~2 per joist crossing, joists typically 16" oc
  const joists = Math.ceil(runLengthFt / 1.333) + 1;
  const screws = totalBoards * joists * 2;
  return {
    primary: { value: totalBoards, decimals: 0, unit: 'boards', label: `${bl}-ft deck boards` },
    sub: `Covers ${XF.int(totalSf)} sq ft in ${rowsAcross} rows. Total of ${XF.int(linearFt)} linear feet — about ${XF.dec(wastePct, 0)}% waste from rounding.`,
    breakdown: [
      { label: 'Deck area',          value: `${XF.int(totalSf)} sq ft` },
      { label: 'Rows across',        value: `${rowsAcross}` },
      { label: 'Boards per row',     value: `${boardsPerRow}` },
      { label: 'Total boards',       value: `${totalBoards}` },
      { label: 'Total linear feet',  value: `${XF.int(linearFt)} lf` },
      { label: 'Waste',              value: `${XF.dec(wastePct, 0)}%` },
      { label: 'Deck screws (~)',    value: `${XF.int(screws)}` },
    ],
  };
};

// ============================================================
// SOD — pallets and rolls for a lawn area
// ============================================================
function SodCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { length, width, sodType } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Lawn dimensions</label>
        <div className="field-row">
          <XNI value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={1} max={500}/>
          <XNI value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={1} max={500}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Sod cut</label>
        <XPT
          options={[
            { label: 'Slab (2×5\')', value: 'slab' },
            { label: 'Roll (2×4\')', value: 'roll' },
            { label: 'Big roll (4×60\')', value: 'big' },
          ]}
          value={sodType}
          onChange={(v) => setField('sodType', v)}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-subtle)' }}>
          {sodType === 'slab' && 'Hand slabs cover 10 sq ft each. 165 per pallet, 450 sq ft / pallet.'}
          {sodType === 'roll' && 'Small rolls are 8 sq ft each. 56 per pallet, 450 sq ft / pallet.'}
          {sodType === 'big' && 'Big rolls cover 240 sq ft each — for installer crews with rollers.'}
        </div>
      </div>
    </>
  );
}
SodCalculator.convertState = function (s, from, to) {
  if (from === to) return s;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return { ...s, length: +(s.length * k).toFixed(dec), width: +(s.width * k).toFixed(dec) };
};
SodCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const sf = toFt3(state.length, isImp) * toFt3(state.width, isImp);
  const withWaste = sf * 1.07;
  const palletSf = 450;
  const pallets = Math.ceil(withWaste / palletSf);
  const perUnit = state.sodType === 'slab' ? 10 : state.sodType === 'roll' ? 8 : 240;
  const units2 = Math.ceil(withWaste / perUnit);
  const sqM = sf * 0.092903;
  const withWasteSm = withWaste * 0.092903;
  return {
    primary: { value: pallets, decimals: 0, unit: pallets === 1 ? 'pallet' : 'pallets', label: 'Sod needed' },
    sub: `Or ${units2} ${state.sodType === 'big' ? 'big rolls' : state.sodType === 'roll' ? 'small rolls' : 'slabs'} loose. Plan to lay within 24 hours of delivery.`,
    breakdown: isImp ? [
      { label: 'Lawn area',        value: `${XF.int(sf)} sq ft` },
      { label: 'Metric',           value: `${XF.dec(sqM, 1)} m²` },
      { label: 'With 7% waste',    value: `${XF.int(withWaste)} sq ft` },
      { label: 'Pallets (450 sf)', value: `${pallets}` },
      { label: 'Loose units',      value: `${units2}` },
    ] : [
      { label: 'Lawn area',        value: `${XF.dec(sqM, 1)} m²` },
      { label: 'Imperial',         value: `${XF.int(sf)} sq ft` },
      { label: 'With 7% waste',    value: `${XF.dec(withWasteSm, 1)} m²` },
      { label: 'Pallets (≈42 m²)', value: `${pallets}` },
      { label: 'Loose units',      value: `${units2}` },
    ],
  };
};

// ============================================================
// TRIM & CEILING PAINT — per surface breakdown
// ============================================================
function TrimCeilingPaintCalculator({ state, setField, units }) {
  const isImp = units === 'imperial';
  const { length, width, height, trimWidth, doors, windows, coats } = state;
  return (
    <>
      <div className="field">
        <label className="field-label">Room dimensions</label>
        <div className="field-row">
          <XNI value={length} onChange={(v) => setField('length', v)} unit={isImp ? 'ft' : 'm'} min={1} max={200}/>
          <XNI value={width} onChange={(v) => setField('width', v)} unit={isImp ? 'ft' : 'm'} min={1} max={200}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11.5, color: 'var(--fg-subtle)' }}>
          <span>Length</span><span>Width</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Ceiling height</label>
        <XNI value={height} onChange={(v) => setField('height', v)} unit={isImp ? 'ft' : 'm'} min={6} max={20}/>
      </div>
      <div className="field">
        <label className="field-label">Baseboard height <span className="field-hint">trim width</span></label>
        <XSL value={trimWidth} onChange={(v) => setField('trimWidth', v)} min={2} max={8} step={0.25} format={v => `${v}"`}/>
      </div>
      <div className="field-row">
        <div className="field" style={{ marginTop: 0 }}>
          <label className="field-label">Doors</label>
          <XNI value={doors} onChange={(v) => setField('doors', v)} min={0} max={20}/>
        </div>
        <div className="field" style={{ marginTop: 0 }}>
          <label className="field-label">Windows</label>
          <XNI value={windows} onChange={(v) => setField('windows', v)} min={0} max={20}/>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Coats</label>
        <XSL value={coats} onChange={(v) => setField('coats', v)} min={1} max={3} step={1} format={v => `${v} coat${v > 1 ? 's' : ''}`}/>
      </div>
    </>
  );
}
TrimCeilingPaintCalculator.convertState = function (s, from, to) {
  if (from === to) return s;
  const m2ft = 3.28084, ft2m = 0.3048;
  const k = from === 'imperial' && to === 'metric' ? ft2m : m2ft;
  const dec = from === 'imperial' && to === 'metric' ? 2 : 1;
  return { ...s, length: +(s.length * k).toFixed(dec), width: +(s.width * k).toFixed(dec), height: +(s.height * k).toFixed(dec) };
};
TrimCeilingPaintCalculator.compute = function (state, units) {
  const isImp = units === 'imperial';
  const L = toFt3(state.length, isImp), W = toFt3(state.width, isImp);
  const perimeter = 2 * (L + W);
  const ceilingArea = L * W;
  const trimSf = perimeter * ((state.trimWidth || 4) / 12);
  // Door casings ≈ 20 lf × 3" = 5 sf; window casings ≈ 18 lf × 3" = 4.5 sf
  const doorTrim = (state.doors || 0) * 5;
  const winTrim = (state.windows || 0) * 4.5;
  const trimAreaSf = trimSf + doorTrim + winTrim;
  const totalTrim = trimAreaSf * (state.coats || 2);
  const ceilingTotal = ceilingArea * (state.coats || 2);
  // Coverage: ceilings 350 sf/gal flat, trim 400 sf/gal (semi-gloss)
  const ceilingGal = ceilingTotal / 350;
  const trimGal = totalTrim / 400;
  const totalGal = ceilingGal + trimGal;
  const totalL = totalGal * 3.78541;
  const sm = (sf) => sf * 0.092903;
  const m = (lf) => lf * 0.3048;
  return {
    primary: {
      value: isImp ? totalGal : totalL,
      decimals: 1,
      unit: isImp ? 'gallons' : 'liters',
      label: 'Total trim + ceiling paint',
    },
    sub: isImp
      ? `That's ${Math.ceil(ceilingGal)} gal of ceiling paint and ${Math.ceil(trimGal)} gal of semi-gloss trim — buy them separately, they're different sheens.`
      : `That's ${XF.dec(ceilingGal * 3.78541, 1)} L of ceiling paint and ${XF.dec(trimGal * 3.78541, 1)} L of semi-gloss trim — buy them separately, they're different sheens.`,
    breakdown: isImp ? [
      { label: 'Ceiling area',      value: `${XF.int(ceilingArea)} sq ft` },
      { label: 'Baseboard (lf)',    value: `${XF.int(perimeter)} lf` },
      { label: 'Trim area',         value: `${XF.dec(trimAreaSf, 1)} sq ft` },
      { label: 'Ceiling paint',     value: `${XF.dec(ceilingGal, 2)} gal (${Math.ceil(ceilingGal)})` },
      { label: 'Trim paint',        value: `${XF.dec(trimGal, 2)} gal (${Math.ceil(trimGal)})` },
    ] : [
      { label: 'Ceiling area',      value: `${XF.dec(sm(ceilingArea), 1)} m²` },
      { label: 'Baseboard',         value: `${XF.dec(m(perimeter), 1)} m` },
      { label: 'Trim area',         value: `${XF.dec(sm(trimAreaSf), 2)} m²` },
      { label: 'Ceiling paint',     value: `${XF.dec(ceilingGal * 3.78541, 1)} L (${Math.ceil(ceilingGal * 3.78541)})` },
      { label: 'Trim paint',        value: `${XF.dec(trimGal * 3.78541, 1)} L (${Math.ceil(trimGal * 3.78541)})` },
    ],
  };
};

// ============================================================
// REGISTER
// ============================================================
Object.assign(window.Calcs, {
  'footing-pier': {
    Component: FootingPierCalculator,
    initial: { type: 'tube', diameter: 12, length: 2, width: 2, height: 4, qty: 6 },
    title: 'Footing & Pier Calculator',
    subtitle: 'Concrete volume and bag counts for sonotube piers and rectangular footings.',
    category: 'concrete',
    formula: [
      ['tube area',  '= π × (D ÷ 2)²'],
      ['rect area',  '= L × W'],
      ['volume',     '= area × height'],
      ['per unit',   '× quantity'],
      ['bags',       '= ceil(ft³ ÷ 0.45) for 60 lb'],
    ],
    howWorks: `Footings and piers are the small but critical concrete pours that anchor a deck, fence, shed, or porch. Sonotubes are cardboard cylinders you stick in the ground and fill with concrete — common diameters are 8, 10, 12, and 16 inches. Rectangular footings are formed with plywood and used under load-bearing posts or column bases. Compute the volume of one unit (cross-section area × depth), multiply by the quantity, and convert: 0.45 ft³ per 60 lb bag, 0.60 ft³ per 80 lb bag, 27 ft³ per cubic yard. Below ½ yd³, bagged is almost always cheaper than a short-load truck delivery.`,
  },
  'drywall-finishing': {
    Component: DrywallFinishingCalculator,
    initial: { area: 800, joints: 'standard' },
    title: 'Drywall Mud, Tape & Screws',
    subtitle: 'Joint compound buckets, paper tape rolls, and screws from square footage.',
    category: 'drywall',
    formula: [
      ['compound',  '= area × 0.014 gal/sf × factor'],
      ['tape',      '= area × 0.33 lf/sf × factor'],
      ['screws',    '= area × 1.1 / sf × factor'],
      ['',          '(factor: 0.85 / 1.0 / 1.25)'],
    ],
    howWorks: `Once your drywall is hung, the finishing materials are easy to under- or over-buy. USG and Sheetrock 3-coat references put it at about 14 gallons of joint compound and 330 linear feet of paper tape per 1,000 sq ft of drywall installed — adjust up or down by joint complexity. Use light for closets and simple rooms, standard for typical bedrooms, and heavy for finished basements with soffits, vaulted ceilings, or skim coats. Pre-mixed compound comes in 4.5-gallon buckets; paper tape in 250 or 500 foot rolls. Screws follow framing spacing — about one per square foot on walls (16" o.c.) and 1.5 per square foot on ceilings (12" o.c.). Coarse #6 × 1¼" drywall screws run about 250 per pound.`,
  },
  'grout-thinset': {
    Component: GroutThinsetCalculator,
    initial: { area: 100, tileSize: 12, jointWidth: 0.125, thickness: 'standard' },
    title: 'Grout & Thinset Calculator',
    subtitle: 'Bags of thinset mortar and grout from tile area, size, and joint width.',
    category: 'tile',
    formula: [
      ['grout vol',     '= 288 × J × depth ÷ T (in³/sf)'],
      ['grout lbs',     '≈ vol × 0.13 × 1.10 (+10%)'],
      ['thinset cov.',  '= 95 / 80 / 60 sf/bag'],
      ['',              '(small / std / large tiles)'],
    ],
    howWorks: `Grout and thinset coverage depends on tile size and joint width — bigger tiles with tight joints need less grout, smaller tiles with wide joints need a lot more. We compute the joint volume per square foot (288 × joint width × tile depth ÷ tile size, in cubic inches) and convert to pounds of dry mix at 0.13 lb/in³, which is what manufacturer coverage charts (Custom Building Products, Mapei) actually deliver. Thinset coverage runs about 95 sf per 50 lb bag for small tiles, 80 for 12-inch field tile, and 60 for large-format (18"+). Both numbers include a 10% safety margin — running out mid-job ruins a Saturday.`,
  },
  'shingle-bundles': {
    Component: ShingleBundlesCalculator,
    initial: { length: 40, width: 30, pitch: 6, ridgeLf: 50, valleys: 2 },
    title: 'Shingle Bundle Calculator',
    subtitle: 'Bundles of architectural shingles, hip & ridge, and underlayment for a re-roof.',
    category: 'roofing',
    formula: [
      ['footprint',     '= L × W'],
      ['multiplier',    '= √(1 + (pitch ÷ 12)²)'],
      ['roof surface',  '= footprint × multiplier'],
      ['+ waste',       '10% + 2%/valley + 5% if steep'],
      ['bundles',       '= squares × 3'],
    ],
    howWorks: `Roofing is sold by the "square" — 100 square feet of finished roof. Architectural shingles come 3 bundles to the square; the heaviest 3-tab and designer shingles can come 4 bundles. The trick is that your roof is bigger than its footprint: a 6/12 pitched roof has 1.118× the area of the floor below. We multiply your footprint by the pitch factor, add 10% waste for cuts and starter, plus 2% per valley and 5% extra for steep roofs (you waste more shingles on a 10/12 than on a 4/12). Hip and ridge cap is sold separately — one bundle covers about 33 linear feet.`,
  },
  'deck-boards': {
    Component: DeckBoardsCalculator,
    initial: { length: 16, width: 12, boardWidth: 5.5, boardLength: 12, orientation: 'length', gap: 0.125 },
    title: 'Deck Board Calculator',
    subtitle: 'Number of deck boards, linear feet, and screws — accounting for orientation and gap.',
    category: 'lumber',
    formula: [
      ['rows across', '= ceil(perpendicular × 12 ÷ (bw + gap))'],
      ['boards/row',  '= ceil(run length ÷ board length)'],
      ['total',       '= rows × boards/row'],
      ['screws',      '= boards × joists × 2'],
    ],
    howWorks: `Decking is sold in nominal sizes that lie about their actual width: a "2×6" is really 5.5 inches across; "5/4 × 6" composite is also typically 5.5 inches. To estimate boards, divide the deck's perpendicular dimension by (board width + gap) — most decks use a 1/8" gap to let water drain between boards. Then cover the parallel dimension with whatever stock length you bought. Buying 16-foot boards instead of 12-footers can wipe out cut waste on a long deck, but they're heavier and harder to handle solo. Screws: budget about two per joist crossing per board.`,
  },
  'sod': {
    Component: SodCalculator,
    initial: { length: 30, width: 20, sodType: 'slab' },
    title: 'Sod Calculator',
    subtitle: 'Pallets, slabs, or rolls of sod for any lawn area — with installation waste.',
    category: 'landscape',
    formula: [
      ['lawn area',  '= L × W'],
      ['+ waste',    '× 1.07 for cuts'],
      ['pallets',    '= ceil(adj. area ÷ 450 sf)'],
      ['units',      '= ceil(adj. area ÷ piece size)'],
    ],
    howWorks: `Sod is sold by the pallet, which typically covers about 450 square feet — though it varies a little by supplier and grass type. Inside the pallet, you'll find slabs (2 × 5 ft, about 10 sf each) or small rolls (2 × 4 ft, 8 sf). Big rolls (4 × 60 ft, 240 sf each) need an installer crew with a sod roller — homeowners almost always order slab or small roll. Sod is perishable: it should be in the ground within 24 to 36 hours of harvest. Order delivery for the morning you plan to lay, and prep the soil before it arrives. Add 5 to 10% waste for cuts around beds and curves.`,
  },
  'trim-ceiling-paint': {
    Component: TrimCeilingPaintCalculator,
    initial: { length: 14, width: 12, height: 8, trimWidth: 4, doors: 2, windows: 2, coats: 2 },
    title: 'Trim & Ceiling Paint',
    subtitle: 'Gallons of ceiling paint and semi-gloss trim paint, computed separately by surface.',
    category: 'paint',
    formula: [
      ['ceiling',       '= L × W × coats ÷ 350 sf/gal'],
      ['baseboard',     '= 2(L + W) × trim height ÷ 12'],
      ['+ casings',     '+ doors × 5 sf + windows × 4.5 sf'],
      ['trim gallons',  '= trim area ÷ 400 sf/gal'],
    ],
    howWorks: `Most calculators lump all wall and ceiling paint together, but ceilings and trim use different paints. Ceilings get flat or matte at about 350 sf/gal; trim gets semi-gloss enamel at roughly 400 sf/gal (it's denser, but you cut in with a brush so coverage holds up). We measure your ceiling area, multiply by coats. For trim, we estimate baseboard as perimeter × baseboard height, plus a typical 5 sq ft of casing per door and 4.5 sq ft per window. Buy ceiling and trim paint separately and budget one extra quart of trim for touch-ups — semi-gloss shows lap marks badly.`,
  },
});
