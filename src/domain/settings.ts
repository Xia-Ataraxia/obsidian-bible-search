export const LEGACY_FORMAT_TEMPLATE =
  '> [[{bookEn} {chapter}]]:{range}\n> {versesKo}\n>\n> {versesEn}'

export const DEFAULT_FORMAT_TEMPLATE =
  '> [[{bookEn} {chapter}|{bookEn} {range}]]\n> {versesKo}\n>\n> {versesEn}'

/** Upgrades the old default, which rendered `[[John 3]]:3:16`; custom templates are untouched. */
export function migrateLegacyTemplate(data: Record<string, unknown>): Record<string, unknown> {
  if (data.formatTemplate !== LEGACY_FORMAT_TEMPLATE) return data
  return { ...data, formatTemplate: DEFAULT_FORMAT_TEMPLATE }
}

export interface BibleSearchSettings {
  defaultVersion: string
  koreanVersion: string
  englishVersion: string
  formatTemplate: string
  calloutType: string
  showVerseNumbers: boolean
  cacheEnabled: boolean
  cacheTtlMinutes: number
  plugin_notices: { muted: Record<string, boolean> }
  [key: string]: unknown
}

export const DEFAULT_SETTINGS: BibleSearchSettings = {
  defaultVersion: 'GAE',
  koreanVersion: 'GAE',
  englishVersion: 'ESV',
  formatTemplate: DEFAULT_FORMAT_TEMPLATE,
  calloutType: 'bible',
  showVerseNumbers: true,
  cacheEnabled: true,
  cacheTtlMinutes: 30,
  plugin_notices: { muted: {} },
}
