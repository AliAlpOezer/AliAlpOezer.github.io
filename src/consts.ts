/** Site-wide constants. Public information only - see design-record.md, invariant 1. */

export const SITE = {
  /** The name visitors see everywhere: header, titles, copy. */
  name: 'Alp',
  /** Legal name. Only in structured data and the CV, so a search for it still lands here. */
  legalName: 'Ali Alp Özer',
  role: 'AI Engineer',
  location: 'München',
  locality: 'Munich',
  country: 'DE',
  url: 'https://alialpoezer.github.io',
  description:
    'Alp builds AI systems in Munich, mostly to learn how they really work: ' +
    'agents, retrieval, and the tests that show whether either one is any good.',
  email: 'alialp@live.com',
  github: 'https://github.com/AliAlpOezer',
  linkedin: 'https://linkedin.com/in/alialpozer',
} as const;

export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/writing', label: 'Writing' },
  { href: '/journey', label: 'Journey' },
  { href: '/about', label: 'About' },
] as const;
