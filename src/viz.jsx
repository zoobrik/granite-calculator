// Small architectural visualizations, keyed by calc slug.
// Sized to a 240×96 viewBox; styled via currentColor + var(--cat-accent).
// Kept intentionally schematic — these are blueprints, not illustrations.

const VIZ_PROPS = { viewBox: '0 0 240 96', preserveAspectRatio: 'xMidYMid meet', xmlns: 'http://www.w3.org/2000/svg' };

const CalcViz = {
  // -------- PAINT --------
  'wall-paint': () => (
    <svg {...VIZ_PROPS}>
      <rect x="44" y="20" width="152" height="56" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.5"/>
      <rect x="44" y="20" width="78" height="56" fill="var(--cat-accent)" opacity="0.32"/>
      <rect x="68" y="32" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
      <rect x="155" y="42" width="14" height="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
      <rect x="118" y="38" width="9" height="14" rx="1" fill="currentColor" opacity="0.75"/>
      <line x1="122" y1="52" x2="122" y2="64" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
      <line x1="44" y1="84" x2="196" y2="84" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 3"/>
    </svg>
  ),
  'trim-ceiling-paint': () => (
    <svg {...VIZ_PROPS}>
      {/* Ceiling band */}
      <rect x="34" y="14" width="172" height="6" fill="var(--cat-accent)" opacity="0.42"/>
      <rect x="34" y="14" width="172" height="6" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
      {/* Wall */}
      <rect x="34" y="20" width="172" height="56" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      {/* Door casing */}
      <rect x="56" y="34" width="36" height="42" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.6"/>
      <rect x="56" y="34" width="36" height="42" fill="var(--cat-accent)" opacity="0.15"/>
      {/* Window casing */}
      <rect x="138" y="38" width="44" height="22" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.6"/>
      <rect x="138" y="38" width="44" height="22" fill="var(--cat-accent)" opacity="0.15"/>
      {/* Baseboard */}
      <rect x="34" y="76" width="172" height="6" fill="var(--cat-accent)" opacity="0.42"/>
      <rect x="34" y="76" width="172" height="6" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
    </svg>
  ),
  'square-footage': () => (
    <svg {...VIZ_PROPS}>
      <rect x="46" y="22" width="80" height="48" fill="var(--cat-accent)" opacity="0.22"/>
      <rect x="46" y="22" width="80" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      <circle cx="148" cy="46" r="22" fill="var(--cat-accent)" opacity="0.22"/>
      <circle cx="148" cy="46" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      <path d="M 170 60 L 200 22 L 200 74 Z" fill="var(--cat-accent)" opacity="0.22"/>
      <path d="M 170 60 L 200 22 L 200 74 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
    </svg>
  ),
  // -------- CONCRETE --------
  'concrete-slab': () => (
    <svg {...VIZ_PROPS}>
      {/* Slab in perspective */}
      <path d="M 40 38 L 200 38 L 220 58 L 60 58 Z" fill="var(--cat-accent)" opacity="0.28"/>
      <path d="M 40 38 L 200 38 L 220 58 L 60 58 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      {/* Front face */}
      <path d="M 60 58 L 220 58 L 220 76 L 60 76 Z" fill="var(--cat-accent)" opacity="0.18"/>
      <path d="M 60 58 L 220 58 L 220 76 L 60 76 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      {/* Right face */}
      <path d="M 200 38 L 220 58 L 220 76 L 200 56 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
      {/* Thickness tick marks */}
      <line x1="30" y1="58" x2="46" y2="58" stroke="currentColor" strokeWidth="0.9" opacity="0.6"/>
      <line x1="30" y1="76" x2="46" y2="76" stroke="currentColor" strokeWidth="0.9" opacity="0.6"/>
      <line x1="36" y1="58" x2="36" y2="76" stroke="currentColor" strokeWidth="0.9" opacity="0.6"/>
    </svg>
  ),
  'footing-pier': () => (
    <svg {...VIZ_PROPS}>
      {/* Ground line */}
      <line x1="20" y1="60" x2="220" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="3 3"/>
      {/* Pier 1 — sonotube */}
      <rect x="60" y="24" width="28" height="56" fill="var(--cat-accent)" opacity="0.3"/>
      <ellipse cx="74" cy="24" rx="14" ry="3.5" fill="var(--cat-accent)" opacity="0.5"/>
      <ellipse cx="74" cy="24" rx="14" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <line x1="60" y1="24" x2="60" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <line x1="88" y1="24" x2="88" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      {/* Pier 2 */}
      <rect x="118" y="32" width="28" height="48" fill="var(--cat-accent)" opacity="0.3"/>
      <ellipse cx="132" cy="32" rx="14" ry="3.5" fill="var(--cat-accent)" opacity="0.5"/>
      <ellipse cx="132" cy="32" rx="14" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <line x1="118" y1="32" x2="118" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <line x1="146" y1="32" x2="146" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      {/* Pier 3 */}
      <rect x="176" y="36" width="28" height="44" fill="var(--cat-accent)" opacity="0.3"/>
      <ellipse cx="190" cy="36" rx="14" ry="3.5" fill="var(--cat-accent)" opacity="0.5"/>
      <ellipse cx="190" cy="36" rx="14" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <line x1="176" y1="36" x2="176" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <line x1="204" y1="36" x2="204" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
    </svg>
  ),
  // -------- DRYWALL --------
  'drywall-sheets': () => (
    <svg {...VIZ_PROPS}>
      <rect x="34" y="18" width="58" height="60" fill="var(--cat-accent)" opacity="0.18"/>
      <rect x="34" y="18" width="58" height="60" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.7"/>
      <rect x="92" y="18" width="58" height="60" fill="var(--cat-accent)" opacity="0.26"/>
      <rect x="92" y="18" width="58" height="60" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.7"/>
      <rect x="150" y="18" width="58" height="60" fill="var(--cat-accent)" opacity="0.18"/>
      <rect x="150" y="18" width="58" height="60" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.7"/>
      {/* corner screws */}
      {[34, 92, 150, 208].flatMap(x => [18, 78].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="currentColor" opacity="0.7"/>
      )))}
    </svg>
  ),
  'drywall-finishing': () => (
    <svg {...VIZ_PROPS}>
      {/* Two sheets meeting */}
      <rect x="30" y="22" width="84" height="52" fill="currentColor" opacity="0.04"/>
      <rect x="30" y="22" width="84" height="52" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <rect x="126" y="22" width="84" height="52" fill="currentColor" opacity="0.04"/>
      <rect x="126" y="22" width="84" height="52" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      {/* Feathered mud over seam */}
      <path d="M 96 36 Q 120 30 144 36 L 144 60 Q 120 66 96 60 Z" fill="var(--cat-accent)" opacity="0.35"/>
      <path d="M 96 36 Q 120 30 144 36 L 144 60 Q 120 66 96 60 Z" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.6"/>
      {/* Tape line */}
      <line x1="106" y1="40" x2="134" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.5" strokeDasharray="2 2"/>
      <line x1="106" y1="56" x2="134" y2="56" stroke="currentColor" strokeWidth="0.8" opacity="0.5" strokeDasharray="2 2"/>
      {/* Seam line */}
      <line x1="120" y1="22" x2="120" y2="74" stroke="currentColor" strokeWidth="0.6" opacity="0.45"/>
    </svg>
  ),
  // -------- TILE --------
  'tile-boxes': () => (
    <svg {...VIZ_PROPS}>
      {[0,1,2,3,4].flatMap(c => [0,1,2].map(r => {
        const x = 30 + c * 36;
        const y = 18 + r * 22;
        const isAccent = (c + r) % 3 === 0;
        const isCut = c === 4 && r === 0;
        return (
          <rect key={`${c}-${r}`}
            x={x} y={y}
            width={isCut ? 18 : 32}
            height="18"
            fill={isAccent ? 'var(--cat-accent)' : 'currentColor'}
            fillOpacity={isAccent ? 0.4 : 0.07}
            stroke="currentColor"
            strokeWidth="0.9"
            strokeOpacity="0.55"
          />
        );
      }))}
    </svg>
  ),
  'grout-thinset': () => (
    <svg {...VIZ_PROPS}>
      {/* Substrate */}
      <rect x="20" y="62" width="200" height="14" fill="currentColor" opacity="0.08"/>
      <rect x="20" y="62" width="200" height="14" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.45"/>
      {/* Thinset layer w/ notches */}
      <path d="M 20 62 L 220 62 L 220 56 L 215 50 L 210 56 L 205 50 L 200 56 L 195 50 L 190 56 L 185 50 L 180 56 L 175 50 L 170 56 L 165 50 L 160 56 L 155 50 L 150 56 L 145 50 L 140 56 L 135 50 L 130 56 L 125 50 L 120 56 L 115 50 L 110 56 L 105 50 L 100 56 L 95 50 L 90 56 L 85 50 L 80 56 L 75 50 L 70 56 L 65 50 L 60 56 L 55 50 L 50 56 L 45 50 L 40 56 L 35 50 L 30 56 L 25 50 L 20 56 Z" fill="var(--cat-accent)" opacity="0.35"/>
      {/* Tiles */}
      <rect x="30" y="24" width="56" height="26" fill="currentColor" opacity="0.18"/>
      <rect x="30" y="24" width="56" height="26" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <rect x="92" y="24" width="56" height="26" fill="currentColor" opacity="0.18"/>
      <rect x="92" y="24" width="56" height="26" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
      <rect x="154" y="24" width="56" height="26" fill="currentColor" opacity="0.18"/>
      <rect x="154" y="24" width="56" height="26" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
    </svg>
  ),
  // -------- ROOFING --------
  'roof-pitch': () => (
    <svg {...VIZ_PROPS}>
      {/* Right angle base */}
      <line x1="40" y1="72" x2="200" y2="72" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      <line x1="200" y1="72" x2="200" y2="32" stroke="currentColor" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 3"/>
      {/* Hypotenuse */}
      <line x1="40" y1="72" x2="200" y2="32" stroke="var(--cat-accent)" strokeWidth="2.5"/>
      {/* Fill */}
      <path d="M 40 72 L 200 72 L 200 32 Z" fill="var(--cat-accent)" opacity="0.18"/>
      {/* Right angle marker */}
      <path d="M 192 72 L 192 64 L 200 64" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.55"/>
      {/* Angle arc */}
      <path d="M 70 72 A 30 30 0 0 0 60 64" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.55"/>
    </svg>
  ),
  'shingle-bundles': () => (
    <svg {...VIZ_PROPS}>
      {/* Roof slope outline */}
      <path d="M 24 78 L 24 22 L 216 78 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25"/>
      {/* Shingle rows */}
      {[0,1,2,3,4].map(i => {
        const y = 30 + i * 10;
        const x1 = 24;
        const x2 = 24 + (216 - 24) * ((y - 22) / (78 - 22));
        const offset = i % 2 === 0 ? 0 : 8;
        return (
          <g key={i}>
            {Array.from({ length: Math.floor((x2 - x1 - offset) / 16) + 1 }).map((_, j) => {
              const x = x1 + offset + j * 16;
              if (x + 18 > x2 + 4) return null;
              return (
                <rect key={j} x={x} y={y} width="16" height="10"
                  fill={i % 2 === 0 ? 'var(--cat-accent)' : 'currentColor'}
                  fillOpacity={i % 2 === 0 ? 0.42 : 0.18}
                  stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.5"/>
              );
            })}
          </g>
        );
      })}
    </svg>
  ),
  // -------- LUMBER --------
  'board-feet': () => (
    <svg {...VIZ_PROPS}>
      {[0,1,2].map(i => {
        const y = 22 + i * 18;
        return (
          <g key={i}>
            <rect x="30" y={y} width="180" height="12" fill="var(--cat-accent)" opacity={0.32 - i * 0.06}/>
            <rect x="30" y={y} width="180" height="12" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.55"/>
            {/* End grain hatching */}
            <line x1="36" y1={y + 3} x2="42" y2={y + 3} stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
            <line x1="36" y1={y + 6} x2="42" y2={y + 6} stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
            <line x1="36" y1={y + 9} x2="42" y2={y + 9} stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          </g>
        );
      })}
    </svg>
  ),
  'deck-boards': () => (
    <svg {...VIZ_PROPS}>
      {[0,1,2,3,4,5,6].map(i => {
        const x = 24 + i * 28;
        const isAccent = i % 3 === 1;
        return (
          <rect key={i} x={x} y="20" width="20" height="56"
            fill={isAccent ? 'var(--cat-accent)' : 'currentColor'}
            fillOpacity={isAccent ? 0.38 : 0.14}
            stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.55"/>
        );
      })}
      {/* Screw dots */}
      {[0,1,2,3,4,5,6].flatMap(i => {
        const cx = 34 + i * 28;
        return [28, 68].map(cy => (
          <circle key={`${i}-${cy}`} cx={cx} cy={cy} r="1" fill="currentColor" opacity="0.7"/>
        ));
      })}
    </svg>
  ),
  'stair-stringer': () => (
    <svg {...VIZ_PROPS}>
      {/* Stringer profile */}
      <path d="M 30 76 L 30 66 L 60 66 L 60 56 L 90 56 L 90 46 L 120 46 L 120 36 L 150 36 L 150 26 L 180 26 L 180 16 L 210 16 L 210 76 Z"
        fill="var(--cat-accent)" opacity="0.28"/>
      <path d="M 30 76 L 30 66 L 60 66 L 60 56 L 90 56 L 90 46 L 120 46 L 120 36 L 150 36 L 150 26 L 180 26 L 180 16"
        fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.75"/>
      {/* Tread tops */}
      {[66, 56, 46, 36, 26].map((y, i) => (
        <line key={i} x1={30 + i * 30} y1={y} x2={60 + i * 30} y2={y} stroke="var(--cat-accent)" strokeWidth="2" opacity="0.9"/>
      ))}
    </svg>
  ),
  // -------- LANDSCAPE --------
  'mulch': () => (
    <svg {...VIZ_PROPS}>
      {/* Ground line */}
      <line x1="20" y1="60" x2="220" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="3 3"/>
      {/* Mulch layer */}
      <path d="M 20 60 Q 30 52, 40 56 T 60 53 T 80 54 T 100 50 T 120 52 T 140 51 T 160 54 T 180 50 T 200 53 T 220 56 L 220 76 L 20 76 Z"
        fill="var(--cat-accent)" opacity="0.35"/>
      <path d="M 20 60 Q 30 52, 40 56 T 60 53 T 80 54 T 100 50 T 120 52 T 140 51 T 160 54 T 180 50 T 200 53 T 220 56"
        fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.55"/>
      {/* Plant stem */}
      <line x1="80" y1="32" x2="80" y2="52" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      <path d="M 80 32 Q 72 28 70 22 M 80 36 Q 88 32 90 26 M 80 28 Q 82 22 80 18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      <line x1="150" y1="36" x2="150" y2="54" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
      <path d="M 150 36 Q 142 30 144 24 M 150 38 Q 158 34 156 28" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    </svg>
  ),
  'gravel': () => (
    <svg {...VIZ_PROPS}>
      {/* Outline area */}
      <rect x="30" y="22" width="180" height="54" fill="currentColor" opacity="0.04"/>
      <rect x="30" y="22" width="180" height="54" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 3"/>
      {/* Scattered gravel — deterministic positions */}
      {[
        [46,34,3.5],[62,42,2.8],[78,32,3],[94,46,3.6],[110,36,2.5],[128,44,3.2],[146,32,3.8],[162,44,2.6],[180,36,3.4],[196,42,2.8],
        [54,56,3.2],[72,62,2.5],[90,58,3.5],[108,66,2.8],[126,56,3.1],[144,64,3.6],[162,58,2.7],[180,66,3.2],[196,60,2.8],
        [38,68,2.7],[56,72,3.1],[74,68,2.6],[92,72,3.4]
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill={i % 4 === 0 ? 'var(--cat-accent)' : 'currentColor'}
          fillOpacity={i % 4 === 0 ? 0.55 : 0.32}
          stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4"/>
      ))}
    </svg>
  ),
  'sod': () => (
    <svg {...VIZ_PROPS}>
      {/* Sod squares being laid */}
      {[
        [30, 22], [82, 22], [134, 22],
        [56, 50], [108, 50], [160, 50],
        [30, 50, true], [186, 22, true]
      ].map(([x, y, partial], i) => (
        <g key={i}>
          <rect x={x} y={y} width={partial ? 22 : 48} height="24"
            fill={i % 2 === 0 ? 'var(--cat-accent)' : 'currentColor'}
            fillOpacity={i % 2 === 0 ? 0.42 : 0.22}
            stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.6"/>
          {/* Grass blades */}
          {!partial && [0,1,2,3].map(j => (
            <line key={j}
              x1={x + 8 + j * 10} y1={y + 18}
              x2={x + 8 + j * 10} y2={y + 22}
              stroke="currentColor" strokeWidth="0.6" opacity="0.55"/>
          ))}
        </g>
      ))}
    </svg>
  ),
};

window.CalcViz = CalcViz;
