export interface VersionSource {
  label: string
  rights?: string
  host: string
  url: string
}

const BSKOREA = { host: 'bskorea.or.kr', url: 'https://www.bskorea.or.kr/' }
const BOLLS = { host: 'bolls.life', url: 'https://bolls.life/' }

export const VERSION_SOURCES: Record<string, VersionSource> = {
  GAE: { label: '개역개정', rights: '© 대한성서공회', ...BSKOREA },
  KRV: { label: '개역한글', rights: '© 대한성서공회', ...BSKOREA },
  NIR: { label: '새번역', rights: '© 대한성서공회', ...BSKOREA },
  ESV: { label: 'ESV', rights: '© Crossway', ...BOLLS },
  KJV: { label: 'KJV', ...BOLLS },
}

/** "개역개정 © 대한성서공회"; KJV is public domain, so just "KJV". */
export function sourceCredit(source: VersionSource): string {
  return source.rights ? `${source.label} ${source.rights}` : source.label
}

/** Markdown credit line for the versions an insert actually contains. */
export function sourceLine(versions: string[]): string {
  return [...new Set(versions)]
    .flatMap(code => VERSION_SOURCES[code] ?? [])
    .map(source => `${sourceCredit(source)} · [${source.host}](${source.url})`)
    .join(' | ')
}

/** Appends the credit line, staying inside the passage's blockquote or callout. */
export function appendSourceLine(text: string, versions: string[]): string {
  const line = sourceLine(versions)
  if (!line) return text
  const lastLine = text.slice(text.lastIndexOf('\n') + 1)
  const quote = /^(?:> ?)+/.exec(lastLine)?.[0]
  if (!quote) return `${text}\n\n${line}`
  return `${text}\n${quote.trimEnd()}\n${quote}${line}`
}
