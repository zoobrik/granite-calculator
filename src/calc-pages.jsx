// Individual calculator page — shell, result panel, How it works
const { useState: useSC, useEffect: useEC, useMemo: useMC, useCallback } = React;
const { PillToggle, AnimatedNumber, useLocalStorage, useToast, fmt } = window.Primitives;

function CalcPage({ calcSlug, navigate, showToast }) {
  const calcDef = window.Calcs[calcSlug];
  const { calculators, categories } = window.Data;

  if (!calcDef) {
    return (
      <main className="container" style={{ padding: '80px 0' }}>
        <h1>Calculator not found</h1>
        <p style={{ color: 'var(--fg-muted)' }}>The calculator you're looking for doesn't exist yet.</p>
        <a className="btn btn-secondary" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>← Back to home</a>
      </main>
    );
  }

  const { Component, initial, title, subtitle, category, formula, howWorks } = calcDef;
  const categoryMeta = categories.find(c => c.slug === category);
  const meta = calculators.find(c => c.slug === calcSlug);
  const Icon = Icons[meta?.icon || 'Calculator'];

  // Persisted unit pref
  const [units, setUnits] = useLocalStorage('units', 'imperial');
  const [state, setState] = useSC(() => {
    // If user has metric saved, convert initial imperial state on mount
    if (units === 'metric' && Component.convertState) {
      return Component.convertState(initial, 'imperial', 'metric');
    }
    return initial;
  });

  // Reset state when slug changes
  useEC(() => {
    if (units === 'metric' && Component.convertState) {
      setState(Component.convertState(initial, 'imperial', 'metric'));
    } else {
      setState(initial);
    }
  }, [calcSlug]);

  const setField = useCallback((key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  // When toggling units, convert dimensional fields so the same room is represented
  const handleUnitChange = useCallback((newUnits) => {
    if (newUnits === units) return;
    const convert = Component.convertState;
    if (convert) {
      setState(prev => convert(prev, units, newUnits));
    }
    setUnits(newUnits);
  }, [units, Component, setUnits]);

  const result = useMC(() => Component.compute(state, units), [state, units]);

  // Related calcs: same category + a couple others
  const related = useMC(() => {
    const sameCat = calculators.filter(c => c.category === category && c.slug !== calcSlug);
    const others = calculators.filter(c => c.category !== category && c.slug !== calcSlug && c.popular);
    return [...sameCat, ...others].slice(0, 4);
  }, [calcSlug, category]);

  const pageUrl = `${window.location.origin}/c/${category}/${calcSlug}`;
  const categoryUrl = `${window.location.origin}/category/${category}`;

  const handleCopy = () => {
    const lines = [
      `${title} — Result`,
      ``,
      `${result.primary.label}: ${fmt.dec(result.primary.value, result.primary.decimals)} ${result.primary.unit}`,
      ``,
      `Breakdown:`,
      ...result.breakdown.map(r => `  ${r.label}: ${r.value}`),
      ``,
      `Calculated at ${pageUrl}`,
    ].join('\n');
    navigator.clipboard?.writeText(lines).then(
      () => showToast('Copied to clipboard'),
      () => showToast('Copy failed')
    );
  };

  // Per-page SEO: title, meta description, canonical, JSON-LD graph
  // (SoftwareApplication + HowTo + BreadcrumbList).
  useEC(() => {
    const prevTitle = document.title;
    document.title = `${title} — Granite Calculator`;
    const howToSteps = (formula || []).filter(row => row[0]).map((row, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: row[0],
      text: `${row[0]} ${row[1]}`,
    }));
    window.SEO?.setMeta({
      description: subtitle,
      canonical: pageUrl,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'SoftwareApplication',
            name: title,
            description: subtitle,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            url: pageUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            creator: { '@type': 'Organization', name: 'Granite Calculator' },
          },
          howToSteps.length > 0 && {
            '@type': 'HowTo',
            name: title,
            description: howWorks,
            totalTime: meta?.time ? `PT${parseInt(meta.time)}S` : undefined,
            step: howToSteps,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
              { '@type': 'ListItem', position: 2, name: categoryMeta?.name || category, item: categoryUrl },
              { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
            ],
          },
        ].filter(Boolean),
      },
    });
    return () => {
      document.title = prevTitle;
      window.SEO?.clearJsonLd();
    };
  }, [calcSlug, title, subtitle, category]);

  const handleReset = () => {
    if (units === 'metric' && Component.convertState) {
      setState(Component.convertState(initial, 'imperial', 'metric'));
    } else {
      setState(initial);
    }
    showToast('Reset to defaults');
  };

  return (
    <main className="calc-page fade-up">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
          <span className="breadcrumb-sep">/</span>
          <a href={`/category/${category}`} onClick={(e) => { e.preventDefault(); navigate(`/category/${category}`); }}>{categoryMeta?.name}</a>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{title}</span>
        </div>

        {/* Hero */}
        <header className="calc-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-muted)', display: 'grid', placeItems: 'center', color: 'var(--fg)' }}>
              <Icon size={18}/>
            </span>
            <span style={{ fontSize: 12, color: 'var(--fg-subtle)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {categoryMeta?.name} · {meta?.time || '60s'} to fill in
            </span>
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {/* Shell */}
        <div className="calc-shell">
          {/* Inputs */}
          <div className="calc-panel">
            <div className="calc-panel-head">
              <h2><span className="dot"/> Inputs</h2>
              {!Component.imperialOnly && (
                <PillToggle
                  options={[
                    { label: 'Imperial', value: 'imperial' },
                    { label: 'Metric', value: 'metric' },
                  ]}
                  value={units}
                  onChange={handleUnitChange}
                />
              )}
            </div>
            <div className="calc-panel-body">
              <Component state={state} setField={setField} units={units}/>
            </div>
          </div>

          {/* Results */}
          <div className="result-panel">
            <div className="calc-panel">
              <div className="result-hero">
                <div className="result-hero-bg"/>
                <div className="result-label">{result.primary.label}</div>
                <div className="result-number-row">
                  <span className="result-number">
                    <AnimatedNumber value={result.primary.value} decimals={result.primary.decimals}/>
                  </span>
                  <span className="result-unit">{result.primary.unit}</span>
                </div>
                <p className="result-sub">{result.sub}</p>
              </div>
              <div className="result-breakdown">
                {result.breakdown.map((row, i) => (
                  <div className="breakdown-row" key={i}>
                    <span className="breakdown-label">{row.label}</span>
                    <span className="breakdown-value">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="result-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                  <Icons.Copy size={13}/> Copy
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <Icons.Printer size={13}/> Print
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                  <Icons.Reset size={13}/> Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="calc-aside">
          <article className="aside-block">
            <h2>How this works</h2>
            <p>{howWorks}</p>
            <div className="formula-box">
              {formula.map((row, i) => (
                <div key={i}>
                  <span className="var">{row[0]}</span> <span className="op">{row[1]}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--fg-subtle)' }}>
              Results are estimates. Verify quantities against your supplier's spec and local building code before ordering.
            </p>
          </article>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="related">
            <div className="section-head" style={{ marginBottom: 24 }}>
              <div>
                <div className="section-label">Keep going</div>
                <h2 className="section-title" style={{ fontSize: 28 }}>Related calculators</h2>
              </div>
            </div>
            <div className="calc-grid">
              {related.map(calc => {
                const Viz = window.CalcViz?.[calc.slug];
                const catMeta = categories.find(c => c.slug === calc.category);
                return (
                  <button key={calc.slug} className="calc-card" data-cat={calc.category} onClick={() => navigate(`/c/${calc.category}/${calc.slug}`)}>
                    <div className="calc-card-viz">{Viz ? <Viz/> : null}</div>
                    <div className="calc-card-body">
                      <div className="calc-card-cat">{catMeta?.name}</div>
                      <h3 className="calc-card-title">{calc.title}</h3>
                      <p className="calc-card-desc">{calc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

window.CalcPage = CalcPage;
