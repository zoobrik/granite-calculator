// Category page + About page + 404
const { useEffect: useEffect_cp } = React;

function CategoryPage({ categorySlug, navigate }) {
  const { categories, calculators } = window.Data;
  const cat = categories.find(c => c.slug === categorySlug);
  const calcs = calculators.filter(c => c.category === categorySlug);

  useEffect_cp(() => {
    if (!cat) return;
    document.title = `${cat.name} calculators — Granite Calculator`;
    const origin = window.location.origin;
    const url = `${origin}/category/${categorySlug}`;
    window.SEO?.setMeta({
      description: cat.desc,
      canonical: url,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            name: `${cat.name} calculators`,
            description: cat.desc,
            url,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: calcs.map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${origin}/c/${c.category}/${c.slug}`,
                name: c.title,
              })),
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: cat.name, item: url },
            ],
          },
        ],
      },
    });
    return () => window.SEO?.clearJsonLd();
  }, [categorySlug]);

  if (!cat) {
    return (
      <main className="container" style={{ padding: '80px 0' }}>
        <h1>Category not found</h1>
        <a className="btn btn-secondary" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>← Back to home</a>
      </main>
    );
  }

  return (
    <main className="fade-up">
      <div className="container">
        <div className="breadcrumb" style={{ marginTop: 32 }}>
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{cat.name}</span>
        </div>
        <section className="cat-page-hero">
          <h1>{cat.name} calculators</h1>
          <p>{cat.desc}</p>
        </section>

        {calcs.length > 0 ? (
          <div className="calc-grid" style={{ marginBottom: 64 }}>
            {calcs.map(calc => {
              const Viz = window.CalcViz?.[calc.slug];
              return (
                <button key={calc.slug} className="calc-card" data-cat={calc.category} onClick={() => navigate(`/c/${calc.category}/${calc.slug}`)}>
                  <div className="calc-card-viz">{Viz ? <Viz/> : null}</div>
                  <div className="calc-card-body">
                    <div className="calc-card-cat">{cat.name}</div>
                    <h3 className="calc-card-title">{calc.title}</h3>
                    <p className="calc-card-desc">{calc.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '64px 32px',
            border: '1px dashed var(--border)',
            borderRadius: 14,
            textAlign: 'center',
            marginBottom: 64,
          }}>
            <div style={{ width: 44, height: 44, margin: '0 auto 14px', borderRadius: 10, background: 'var(--bg-muted)', display: 'grid', placeItems: 'center', color: 'var(--fg-muted)' }}>
              <Icons.Calculator size={20}/>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Coming soon</h3>
            <p style={{ margin: 0, color: 'var(--fg-muted)', fontSize: 14 }}>We're working on this category. Check back next week.</p>
          </div>
        )}

        {/* Short SEO intro */}
        <article style={{ maxWidth: 720, margin: '0 0 80px', color: 'var(--fg-muted)', lineHeight: 1.7, fontSize: 15 }}>
          <h2 style={{ color: 'var(--fg)', fontSize: 22, letterSpacing: '-0.02em', fontWeight: 600, margin: '0 0 14px' }}>
            About {cat.name.toLowerCase()} math
          </h2>
          <p>{categoryBlurbs[categorySlug] || 'Detailed guide content coming soon.'}</p>
        </article>
      </div>
    </main>
  );
}

const categoryBlurbs = {
  paint: `Paint quantity is a function of three things: the surface area you're covering, how absorbent that surface is, and how many coats you plan to apply. A gallon of premium interior latex covers about 350 to 400 sq ft on smooth drywall — half that on bare drywall or stucco. Always buy 10% extra for touch-ups; matching paint years later from the same store rarely matches exactly.`,
  concrete: `Concrete is sold by the cubic yard, and most jobs need more than people expect. The trick is volume: a 10×10 patio at 4 inches thick is 1.23 yd³, not "a yard or so." For pours larger than half a cubic yard, ordering ready-mix from a truck is almost always cheaper and more consistent than mixing bags by hand. For smaller pours, 80 lb bags are more economical than 60 lb bags by volume.`,
  drywall: `Drywall comes in 4-foot-wide sheets in 8, 10, and 12 foot lengths. Half-inch is the residential standard; 5/8" fire-rated is required for garages, ceilings spanning 24 inches, and shared walls in multi-family construction. Use the longest sheets that fit your space — fewer butt joints mean less taping and a flatter wall.`,
  tile: `Tile is sold by the box, with each box covering a known number of square feet. Always order 10 to 15% extra to account for cuts, breakage, and future repairs. For diagonal layouts, herringbone, or complex patterns, bump that to 20%. Keep one full box from your dye lot for future touch-ups.`,
  lumber: `Lumber is dimensional, meaning a "2×4" is actually 1.5" × 3.5". Stud counts at 16-inch on-center spacing run roughly one stud per linear foot of wall plus one. Board feet — the unit pricing for hardwood — equals (thickness × width × length) ÷ 144, with all measurements in inches.`,
  roofing: `Roof pitch is expressed as rise over run, typically inches of vertical rise per 12 inches of horizontal run. A 6/12 pitch means 6 inches up for every 12 inches across, or roughly 26.6 degrees. Steeper pitches need different shingle types and add labor cost. Always measure pitch from inside the attic when possible — it's safer than crawling on the roof.`,
  landscape: `Mulch, gravel, and topsoil are sold by the cubic yard, but the math is identical to concrete: length × width × depth, then divide by 27. For mulch, 3 inches is the standard depth — any thicker and you risk root rot. For gravel driveways, plan on 4 to 6 inches of base material.`,
};

function NotFoundPage({ navigate }) {
  return (
    <main className="container fade-up" style={{ textAlign: 'center', padding: '120px 24px' }}>
      <div className="mono" style={{ fontSize: 13, color: 'var(--fg-subtle)', marginBottom: 24, letterSpacing: '0.1em' }}>404</div>
      <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', letterSpacing: '-0.03em', fontWeight: 600, margin: '0 0 16px' }}>
        Page not found.
      </h1>
      <p style={{ fontSize: 17, color: 'var(--fg-muted)', maxWidth: 480, margin: '0 auto 36px' }}>
        We measured twice and cut once, but this page still isn't here. Try one of the calculators instead.
      </p>
      <a className="btn btn-accent btn-lg" href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
        Back home <Icons.ArrowRight size={15}/>
      </a>
    </main>
  );
}

window.CategoryPage = CategoryPage;
window.NotFoundPage = NotFoundPage;
