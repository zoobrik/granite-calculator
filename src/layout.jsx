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

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-disclaimer">
          Estimates only. Verify with your supplier and local building department before ordering materials or starting work. Use at your own risk.
        </div>
        <div className="footer-bottom">
          <div>© 2026 Granite Calculator. All numbers are estimates.</div>
          <div className="footer-attr">Powered by <span className="footer-attr-mark">WhiteCloud</span></div>
        </div>
      </div>
    </footer>
  );
}

window.Layout = { Header, Footer };
