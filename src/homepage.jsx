// Homepage
const { useState: useState_h, useEffect: useEffect_h } = React;

function Homepage({ navigate }) {
  const { calculators, categories, homepageBlurb } = window.Data;
  const popular = calculators.filter(c => c.popular);
  const more = calculators.filter(c => !c.popular);
  const totalCalcs = calculators.length;
  const totalCategories = categories.length;

  useEffect_h(() => {
    document.title = 'Granite Calculator — Free construction & home improvement calculators';
    const origin = window.location.origin;
    window.SEO?.setMeta({
      description: homepageBlurb,
      canonical: `${origin}/`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'Granite Calculator',
            url: `${origin}/`,
            description: homepageBlurb,
            publisher: { '@type': 'Organization', name: 'Granite Calculator' },
          },
          {
            '@type': 'ItemList',
            name: 'Construction calculators',
            itemListElement: calculators.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${origin}/c/${c.category}/${c.slug}`,
              name: c.title,
            })),
          },
        ],
      },
    });
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid"/>
        <div className="container hero-inner fade-up">
          <h1 className="hero-title">
            Construction math,<br/>
            done in <em>seconds</em>.
          </h1>
          <p className="hero-sub">
            {homepageBlurb}
          </p>
          <div className="hero-cta">
            <a className="btn btn-accent btn-lg" href="/c/paint/wall-paint" onClick={(e) => { e.preventDefault(); navigate('/c/paint/wall-paint'); }}>
              Start with paint <Icons.ArrowRight size={15}/>
            </a>
            <a className="btn btn-secondary btn-lg" href="#calculators" onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('calculators');
              if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 60;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}>
              See all {totalCalcs}
            </a>
          </div>
        </div>
      </section>

      {/* Featured grid */}
      <section className="section" id="calculators">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">Popular this week</div>
              <h2 className="section-title">Pick a calculator, get an answer.</h2>
            </div>
            <p className="section-desc">
              Every calculator works in imperial or metric, runs in your browser, and shows the formulas it uses.
            </p>
          </div>
          <div className="calc-grid">
            {popular.map(calc => {
              const Viz = window.CalcViz?.[calc.slug];
              const cat = categories.find(c => c.slug === calc.category);
              return (
                <button
                  key={calc.slug}
                  className="calc-card"
                  data-cat={calc.category}
                  onClick={() => navigate(`/c/${calc.category}/${calc.slug}`)}
                >
                  <div className="calc-card-viz">{Viz ? <Viz/> : null}</div>
                  <div className="calc-card-body">
                    <div className="calc-card-cat">{cat?.name}</div>
                    <h3 className="calc-card-title">{calc.title}</h3>
                    <p className="calc-card-desc">{calc.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {more.length > 0 && (
            <>
              <div style={{ margin: '48px 0 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--fg-subtle)', textTransform: 'uppercase' }}>More calculators</span>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
              </div>
              <div className="calc-grid">
                {more.map(calc => {
                  const Viz = window.CalcViz?.[calc.slug];
                  const cat = categories.find(c => c.slug === calc.category);
                  return (
                    <button
                      key={calc.slug}
                      className="calc-card"
                      data-cat={calc.category}
                      onClick={() => navigate(`/c/${calc.category}/${calc.slug}`)}
                    >
                      <div className="calc-card-viz">{Viz ? <Viz/> : null}</div>
                      <div className="calc-card-body">
                        <div className="calc-card-cat">{cat?.name}</div>
                        <h3 className="calc-card-title">{calc.title}</h3>
                        <p className="calc-card-desc">{calc.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label">All categories</div>
              <h2 className="section-title">Browse by material.</h2>
            </div>
          </div>
          <div className="cats">
            {categories.map(cat => {
              const count = calculators.filter(c => c.category === cat.slug).length;
              return (
                <button key={cat.slug} className="cat" onClick={() => navigate(`/category/${cat.slug}`)}>
                  <div>
                    <div className="cat-title">
                      <span className="cat-title-icon">
                        {Icons[cat.name === 'Paint' ? 'Paint' : cat.name === 'Concrete' ? 'Concrete' : cat.name === 'Drywall' ? 'Drywall' : cat.name === 'Tile' ? 'Tile' : cat.name === 'Lumber' ? 'Lumber' : cat.name === 'Roofing' ? 'Roof' : 'Mulch']({ size: 15 })}
                      </span>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4, marginLeft: 40 }}>{cat.desc}</div>
                  </div>
                  <div className="cat-count">
                    {count} {count === 1 ? 'calc' : 'calcs'}
                    <Icons.ChevronRight size={14}/>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

window.Homepage = Homepage;
