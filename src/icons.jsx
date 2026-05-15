// Lucide-style icons, stroke 1.75. Stable, geometric, no flourishes.
const Icon = ({ children, size = 16, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

const Icons = {
  Logo: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 9 L10 4 L16 4 L20 10 L17 20 L7 19 Z" fill="currentColor"/>
      <path d="M5 9 L10 4 L16 4 L12 11 Z" fill="currentColor" opacity="0.45"/>
      <path d="M16 4 L20 10 L12 11 Z" fill="currentColor" opacity="0.25"/>
    </svg>
  ),
  Sun: (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></Icon>,
  Moon: (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></Icon>,
  ArrowRight: (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>,
  ArrowLeft: (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></Icon>,
  Calculator: (p) => <Icon {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/></Icon>,
  Copy: (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>,
  Printer: (p) => <Icon {...p}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></Icon>,
  Reset: (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 9-9c-2.5 0-4.8 1-6.5 2.6L3 8"/><path d="M3 3v5h5"/></Icon>,
  Check: (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M5 12h14M12 5v14"/></Icon>,
  ChevronDown: (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>,
  ChevronUp: (p) => <Icon {...p}><polyline points="18 15 12 9 6 15"/></Icon>,
  ChevronRight: (p) => <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>,
  Zap: (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>,
  Shield: (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>,
  Eye: (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Github: (p) => <Icon {...p}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></Icon>,
  Twitter: (p) => <Icon {...p}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>,
  // Calculator-specific icons
  Paint: (p) => <Icon {...p}><path d="M19 11h2v8a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2a2 2 0 0 0-2-2h-2"/><rect x="3" y="3" width="14" height="8" rx="1"/></Icon>,
  Concrete: (p) => <Icon {...p}><rect x="3" y="6" width="18" height="14" rx="1"/><path d="M3 12h18M9 6v14M15 6v14"/></Icon>,
  Drywall: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" opacity="0.5"/></Icon>,
  Tile: (p) => <Icon {...p}><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></Icon>,
  Roof: (p) => <Icon {...p}><path d="M3 19l9-14 9 14"/><path d="M3 19h18"/></Icon>,
  Lumber: (p) => <Icon {...p}><rect x="2" y="7" width="20" height="4" rx="1"/><rect x="2" y="13" width="20" height="4" rx="1"/></Icon>,
  Mulch: (p) => <Icon {...p}><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 2 0"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 2 0"/></Icon>,
  Stairs: (p) => <Icon {...p}><path d="M3 21h4v-4h4v-4h4V9h4V5h2"/></Icon>,
  Gravel: (p) => <Icon {...p}><circle cx="6" cy="9" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="10" r="2"/><circle cx="9" cy="15" r="2"/><circle cx="16" cy="17" r="2"/></Icon>,
  Square: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="1"/></Icon>,
  // Shape selectors
  Rectangle: (p) => <Icon {...p}><rect x="2" y="6" width="20" height="12" rx="1"/></Icon>,
  Circle: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/></Icon>,
  Triangle: (p) => <Icon {...p}><path d="M12 3l10 18H2L12 3z"/></Icon>,
  // Misc
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></Icon>,
  Users: (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Icon>,
  Lock: (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>,
  Star: (p) => <Icon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>,
};

window.Icons = Icons;
