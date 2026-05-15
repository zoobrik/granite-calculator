// Top-level app with HTML5 history routing.
// Real URLs (e.g. /c/paint/wall-paint) — every route is independently
// indexable and shareable. Requires the host to serve index.html for unknown
// paths (see _redirects).
const { useState: useS_app, useEffect: useE_app } = React;

function currentPath() {
  return window.location.pathname || '/';
}

// Migrate any legacy hash URL (#/...) to its real path on first load.
(function migrateHash() {
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const target = window.location.hash.slice(1) || '/';
    window.history.replaceState(null, '', target);
  }
})();

function App() {
  const [route, setRoute] = useS_app(currentPath());
  const [theme, setTheme] = window.Primitives.useTheme();
  const [showToast, toastNode] = window.Primitives.useToast();

  useE_app(() => {
    const onPop = () => {
      setRoute(currentPath());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (path) => {
    if (path === currentPath()) return;
    window.history.pushState(null, '', path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Route matching. Treat /, empty, and any /<...>/index.html as root so the
  // app survives being opened on a static server that resolves directories
  // to their index file.
  let view;
  const isHome = route === '/' || route === '' || /\/index\.html?$/i.test(route);
  if (isHome) {
    view = <window.Homepage navigate={navigate} />;
  } else if (route.startsWith('/category/')) {
    const slug = route.slice('/category/'.length).replace(/\/$/, '');
    view = <window.CategoryPage categorySlug={slug} navigate={navigate} />;
  } else if (route.startsWith('/c/')) {
    // /c/<category>/<calc-slug>
    const parts = route.slice(3).replace(/\/$/, '').split('/');
    const calcSlug = parts[1];
    view = <window.CalcPage key={calcSlug} calcSlug={calcSlug} navigate={navigate} showToast={showToast} />;
  } else {
    view = <window.NotFoundPage navigate={navigate} />;
  }

  return (
    <>
      <window.Layout.Header route={route} navigate={navigate} theme={theme} setTheme={setTheme} />
      {view}
      <window.Layout.Footer navigate={navigate} />
      {toastNode}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
