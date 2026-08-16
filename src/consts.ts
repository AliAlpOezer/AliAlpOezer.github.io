/** Site-wide constants. Public information only - see design-record.md, invariant 1. */

export const SITE = {
  name: 'Ali Alp Özer',
  /** Used in <title> suffixes and structured data. */
  shortName: 'Alp Özer',
  role: 'AI Engineer',
  location: 'München',
  locality: 'Munich',
  country: 'DE',
  url: 'https://alpozer.dev',
  description:
    'AI engineer in Munich building retrieval pipelines, autonomous agents, ' +
    'and the evaluation harnesses that prove they work.',
  email: 'alialp@live.com',
  github: 'https://github.com/AliAlpOezer',
  linkedin: 'https://linkedin.com/in/alialpozer',
} as const;

export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/writing', label: 'Writing' },
  { href: '/journey', label: 'Journey' },
  { href: '/about', label: 'About' },
] as const;
