// Calculator registry, categories, content
const categories = [
  { slug: 'paint',     name: 'Paint',     desc: 'Estimate gallons of paint and primer for walls, ceilings, and trim.' },
  { slug: 'concrete',  name: 'Concrete',  desc: 'Cubic yards and bag counts for slabs, footings, and tubes.' },
  { slug: 'drywall',   name: 'Drywall',   desc: 'Sheet counts, fasteners, mud, and tape for any wall area.' },
  { slug: 'tile',      name: 'Tile',      desc: 'Boxes of tile with waste factor for floors, walls, and backsplashes.' },
  { slug: 'lumber',    name: 'Lumber',    desc: 'Board feet, linear feet, and stud counts for framing.' },
  { slug: 'roofing',   name: 'Roofing',   desc: 'Pitch, area, and shingle bundles for replacement projects.' },
  { slug: 'landscape', name: 'Landscape', desc: 'Mulch, gravel, and topsoil by the cubic yard.' },
];

const calculators = [
  { slug: 'wall-paint',         category: 'paint',     icon: 'Paint',     title: 'Wall Paint Calculator',     desc: 'Gallons needed for any room — accounts for doors, windows, and coats.', popular: true,  time: '60s' },
  { slug: 'concrete-slab',      category: 'concrete',  icon: 'Concrete',  title: 'Concrete Slab Calculator',  desc: 'Cubic yards and 60 lb bag counts for rectangular slabs and footings.',   popular: true,  time: '45s' },
  { slug: 'drywall-sheets',     category: 'drywall',   icon: 'Drywall',   title: 'Drywall Sheet Calculator',  desc: 'Sheets needed for any room with 4×8 or 4×12 sheets.',                   popular: true,  time: '45s' },
  { slug: 'tile-boxes',         category: 'tile',      icon: 'Tile',      title: 'Tile Box Calculator',       desc: 'Boxes needed with adjustable waste factor for cuts and breakage.',       popular: true,  time: '60s' },
  { slug: 'roof-pitch',         category: 'roofing',   icon: 'Roof',      title: 'Roof Pitch Calculator',     desc: 'Convert rise over run to pitch ratio and degrees of slope.',             popular: true,  time: '30s' },
  { slug: 'board-feet',         category: 'lumber',    icon: 'Lumber',    title: 'Board Feet Calculator',     desc: 'Board feet from thickness, width, and length for any species.',          popular: true,  time: '30s' },
  { slug: 'mulch',              category: 'landscape', icon: 'Mulch',     title: 'Mulch Calculator',          desc: 'Cubic yards for garden beds at any depth.',                              popular: false, time: '30s' },
  { slug: 'stair-stringer',     category: 'lumber',    icon: 'Stairs',    title: 'Stair Stringer Calculator', desc: 'Total rise, run, and tread count for a code-compliant stringer.',        popular: false, time: '90s' },
  { slug: 'gravel',             category: 'landscape', icon: 'Gravel',    title: 'Gravel Calculator',         desc: 'Cubic yards of gravel for driveways and paths.',                         popular: false, time: '30s' },
  { slug: 'square-footage',     category: 'paint',     icon: 'Square',    title: 'Square Footage Calculator', desc: 'Total area for rooms with multiple shapes — rectangles, circles, and triangles.', popular: true,  time: '60s' },
  { slug: 'footing-pier',       category: 'concrete',  icon: 'Concrete',  title: 'Footing & Pier Calculator', desc: 'Sonotubes and rectangular footings — volume, bags, and cost per yard.',          popular: false, time: '60s' },
  { slug: 'drywall-finishing',  category: 'drywall',   icon: 'Drywall',   title: 'Mud, Tape & Screws',        desc: 'Joint compound buckets, paper tape rolls, and screws from square footage.',       popular: false, time: '30s' },
  { slug: 'grout-thinset',      category: 'tile',      icon: 'Tile',      title: 'Grout & Thinset',           desc: 'Bags of thinset mortar and grout based on tile size and joint width.',            popular: false, time: '45s' },
  { slug: 'shingle-bundles',    category: 'roofing',   icon: 'Roof',      title: 'Shingle Bundle Calculator', desc: 'Bundles, hip & ridge, and underlayment for a re-roof — pitch-corrected.',         popular: true,  time: '60s' },
  { slug: 'deck-boards',        category: 'lumber',    icon: 'Lumber',    title: 'Deck Board Calculator',     desc: 'Number of deck boards and screws for any deck size, with gap and orientation.',   popular: true,  time: '60s' },
  { slug: 'sod',                category: 'landscape', icon: 'Mulch',     title: 'Sod Calculator',            desc: 'Pallets, slabs, and rolls of sod for any lawn area, with installation waste.',    popular: false, time: '30s' },
  { slug: 'trim-ceiling-paint', category: 'paint',     icon: 'Paint',     title: 'Trim & Ceiling Paint',      desc: 'Ceiling paint and semi-gloss trim paint, computed separately by surface.',        popular: false, time: '60s' },
];

const homepageBlurb = 'Free, fast, and accurate calculators for every common construction and home-improvement material. No signup, no ads, no fluff.';

window.Data = { categories, calculators, homepageBlurb };
