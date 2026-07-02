const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

function createEnvironment() {
  global.React = {
    createElement: () => null,
    Fragment: Symbol.for('react.fragment'),
    useState: () => [null, () => {}],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useRef: () => ({ current: null }),
    useCallback: (fn) => fn,
  };

  const fmt = {
    num: (n, d = 0) => isFinite(n) ? Number(n).toLocaleString('en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }) : '0',
    int: (n) => fmt.num(n, 0),
    dec: (n, d = 2) => fmt.num(n, d),
  };

  global.window = {
    Primitives: {
      fmt,
      NumberInput: () => null,
      PillToggle: () => null,
      Slider: () => null,
      AnimatedNumber: () => null,
      useTheme: () => [null, () => {}],
      useLocalStorage: () => [null, () => {}],
      useCountUp: (v) => v,
      useToast: () => [() => {}, null],
    },
    Calcs: {},
    Data: {},
    Icons: new Proxy({}, { get: () => () => null }),
  };
  global.Icons = global.window.Icons;
  return global.window;
}

function loadCalcs() {
  const window = createEnvironment();
  const srcDir = path.join(__dirname, '..', 'src');
  const order = [
    'data.jsx',
    'primitives.jsx',
    'calculators.jsx',
    'more-calculators.jsx',
    'extra-calculators.jsx',
  ];

  for (const file of order) {
    const code = fs.readFileSync(path.join(srcDir, file), 'utf8');
    const transpiled = esbuild.transformSync(code, {
      loader: 'jsx',
      target: 'es2020',
      format: 'cjs',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    }).code;

    try {
      new Function('window', 'React', 'Icons', transpiled)
        (window, global.React, global.Icons);
    } catch (e) {
      console.error(`load ${file}:`, e.message);
      process.exit(1);
    }
  }

  return window;
}

module.exports = { loadCalcs };
