// Header + Footer
const { useState: useState_l, useEffect: useEffect_l } = React;

function Header({ route, navigate, theme, setTheme }) {
  const [scrolled, setScrolled] = useState_l(false);
  useEffect_l(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/', label: 'Calculators', match: (r) => r === '/' || r === '' },
    { href: '/category/paint', label: 'Paint', match: (r) => r === '/category/paint' },
    { href: '/category/concrete', label: 'Concrete', match: (r) => r === '/category/concrete' },
    { href: '/category/drywall', label: 'Drywall', match: (r) => r === '/category/drywall' },
  ];

  return (
    <header className="header" style={{ borderBottomColor: scrolled ? '' : 'transparent' }}>
      <div className="container header-inner">
        <a href="/" className="brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <span className="brand-mark"><Icons.Logo/></span>
          <span>Granite Calculator</span>
        </a>
        <nav className="nav">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`nav-link ${l.match(route) ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate(l.href); }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Icons.Sun size={16}/> : <Icons.Moon size={16}/>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer({ navigate }) {
  const { categories } = window.Data;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              <span className="brand-mark"><Icons.Logo/></span>
              <span>Granite Calculator</span>
            </a>
            <p style={{ margin: 0 }}>
              Free construction calculators built by people who actually swing a hammer.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Categories</div>
            {categories.slice(0, 4).map(c => (
              <a key={c.slug} className="footer-link" href={`/category/${c.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/category/${c.slug}`); }}>{c.name}</a>
            ))}
          </div>
          <div>
            <div className="footer-col-title">Popular</div>
            <a className="footer-link" href="/c/paint/wall-paint" onClick={(e) => { e.preventDefault(); navigate('/c/paint/wall-paint'); }}>Wall paint</a>
            <a className="footer-link" href="/c/concrete/concrete-slab" onClick={(e) => { e.preventDefault(); navigate('/c/concrete/concrete-slab'); }}>Concrete slab</a>
            <a className="footer-link" href="/c/drywall/drywall-sheets" onClick={(e) => { e.preventDefault(); navigate('/c/drywall/drywall-sheets'); }}>Drywall sheets</a>
            <a className="footer-link" href="/c/roofing/roof-pitch" onClick={(e) => { e.preventDefault(); navigate('/c/roofing/roof-pitch'); }}>Roof pitch</a>
          </div>
          <div>
            <div className="footer-col-title">Project</div>
            <a className="footer-link" href="mailto:hello@granitecalculator.com">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Granite Calculator. All numbers are estimates. Verify with local code.</div>
          <div className="mono">v0.4.2 — built in Brooklyn</div>
        </div>
      </div>
    </footer>
  );
}

window.Layout = { Header, Footer };
