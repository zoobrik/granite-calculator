// Shared primitive components: inputs, toggles, buttons, hooks
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// -- Hooks ---------------------------------------------------------------
function useTheme() {
  const [theme, setThemeState] = useState(() => document.documentElement.dataset.theme || 'light');
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    // Keep the address-bar/PWA theme color in sync with the active theme.
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#1a1a1a' : '#fafaf7');
    setThemeState(t);
  };
  return [theme, setTheme];
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch (e) { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }, [key, value]);
  return [value, setValue];
}

// Count-up: smoothly animates a number toward `value` using requestAnimationFrame.
function useCountUp(value, { duration = 420 } = {}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    if (Math.abs(from - to) < 0.0001 || !isFinite(from) || !isFinite(to)) {
      setDisplay(to);
      return;
    }
    let rafId;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const e = 1 - Math.pow(1 - t, 4);
      setDisplay(from + (to - from) * e);
      if (t < 1) rafId = requestAnimationFrame(step);
      else setDisplay(to);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return display;
}

// -- Format ------------------------------------------------------------------
const fmt = {
  num: (n, decimals = 0) => {
    if (!isFinite(n)) return '0';
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },
  int: (n) => fmt.num(n, 0),
  dec: (n, d = 2) => fmt.num(n, d),
};

// -- AnimatedNumber: display-only count-up ----------------------------------
function AnimatedNumber({ value, decimals = 0, className = '' }) {
  const animated = useCountUp(value);
  return <span className={`mono ${className}`}>{fmt.num(animated, decimals)}</span>;
}

// -- NumberInput -------------------------------------------------------------
function NumberInput({ value, onChange, unit, min = 0, max = 99999, step = 1, placeholder, disabled }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  useEffect(() => {
    if (!focused) setDraft(value === '' || value == null ? '' : String(value));
  }, [value, focused]);

  const commit = (raw) => {
    if (raw === '' || raw == null) { onChange(''); return; }
    let n = parseFloat(raw);
    if (isNaN(n)) { onChange(''); return; }
    if (n < min) n = min;
    if (n > max) n = max;
    onChange(n);
  };

  const inc = (dir) => {
    const n = typeof value === 'number' ? value : 0;
    const next = Math.min(max, Math.max(min, +(n + dir * step).toFixed(4)));
    onChange(next);
  };

  return (
    <div className="input-wrap">
      <input
        type="text"
        inputMode={min < 0 ? 'decimal' : 'numeric'}
        value={draft}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          // Extract first valid decimal. Disallow the leading "-" if min >= 0
          // so "-5" silently clamping to 0 doesn't surprise the user.
          const allowNeg = min < 0;
          const re = allowNeg ? /^-?\d*\.?\d*/ : /^\d*\.?\d*/;
          const m = e.target.value.match(re);
          const raw = m ? m[0] : '';
          setDraft(raw);
          commit(raw);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); }}
      />
      {unit && <div className="input-suffix">{unit}</div>}
      <div className="steppers" aria-hidden="true">
        <button className="stepper" tabIndex={-1} onClick={() => inc(1)} type="button"><Icons.ChevronUp size={11}/></button>
        <button className="stepper" tabIndex={-1} onClick={() => inc(-1)} type="button"><Icons.ChevronDown size={11}/></button>
      </div>
    </div>
  );
}

// -- PillToggle (segmented control with animated thumb) ----------------------
function PillToggle({ options, value, onChange }) {
  const containerRef = useRef(null);
  const [thumb, setThumb] = useState({ x: 0, w: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const idx = options.findIndex(o => o.value === value);
    const btns = containerRef.current.querySelectorAll('button');
    const el = btns[idx];
    if (el) {
      setThumb({ x: el.offsetLeft - 3, w: el.offsetWidth });
    }
  }, [value, options]);

  return (
    <div className="pill-toggle" ref={containerRef}>
      <div
        className="pill-thumb"
        style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }}
      />
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={value === opt.value ? 'active' : ''}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// -- Slider ------------------------------------------------------------------
function Slider({ value, onChange, min = 0, max = 100, step = 1, format }) {
  return (
    <div className="slider-row">
      <input
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="slider-value mono">{format ? format(value) : value}</div>
    </div>
  );
}

// -- Toast -------------------------------------------------------------------
function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(0);
  const show = (msg) => {
    clearTimeout(timerRef.current);
    setToast(msg);
    timerRef.current = setTimeout(() => setToast(null), 1800);
  };
  const node = (
    <div className={`toast ${toast ? 'show' : ''}`}>
      <Icons.Check size={14}/>
      <span>{toast}</span>
    </div>
  );
  return [show, node];
}

window.Primitives = {
  useTheme, useLocalStorage, useCountUp, useToast,
  fmt, AnimatedNumber,
  NumberInput, PillToggle, Slider,
};

// -- Unit conversion helpers ------------------------------------------------
// Single source of truth for the conversion factors used across calculators.
const FT_PER_M  = 3.28084;
const M_PER_FT  = 0.3048;
const SM_PER_SF = 0.092903;
const M3_PER_FT3 = 0.0283168;
const L_PER_GAL = 3.78541;
const CM_PER_IN = 2.54;

const Conv = {
  FT_PER_M, M_PER_FT, SM_PER_SF, M3_PER_FT3, L_PER_GAL, CM_PER_IN,
  toFt: (v, isImp) => isImp ? v : (v || 0) * FT_PER_M,
  sm: (sf) => sf * SM_PER_SF,
  m:  (lf) => lf * M_PER_FT,
  liters: (gal) => gal * L_PER_GAL,
  // Convert a set of dimensional fields (in ft/m) between systems and round.
  // Used by every calc whose convertState only touches length-like fields.
  convertDims(state, keys, from, to) {
    if (from === to) return state;
    const toMetric = from === 'imperial' && to === 'metric';
    const k = toMetric ? M_PER_FT : FT_PER_M;
    const dec = toMetric ? 2 : 1;
    const out = { ...state };
    for (const key of keys) {
      if (state[key] != null) out[key] = +(state[key] * k).toFixed(dec);
    }
    return out;
  },
};
window.Conv = Conv;

// -- SEO helpers (dynamic <title>, <meta description>, canonical, JSON-LD) ---
const SEO_JSON_LD_ID = 'route-jsonld';
const SEO_DESC_ID = 'route-description';
const SEO_CANONICAL_ID = 'route-canonical';

function ensureMeta(name, id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    el.id = id;
    document.head.appendChild(el);
  }
  return el;
}
function ensureLink(rel, id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.id = id;
    document.head.appendChild(el);
  }
  return el;
}
function setMeta({ description, canonical, jsonLd } = {}) {
  if (description) ensureMeta('description', SEO_DESC_ID).setAttribute('content', description);
  if (canonical) ensureLink('canonical', SEO_CANONICAL_ID).setAttribute('href', canonical);
  if (jsonLd) {
    let script = document.getElementById(SEO_JSON_LD_ID);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = SEO_JSON_LD_ID;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }
}
function clearJsonLd() {
  const script = document.getElementById(SEO_JSON_LD_ID);
  if (script) script.remove();
}

window.SEO = { setMeta, clearJsonLd };
