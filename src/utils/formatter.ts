import { ParsedReference, VerseData } from '../types/index'
import { BibleSearchSettings } from '../domain/settings'
import { resolveTemplate, TemplateContext } from './resolve-template'

export interface ExtraVerses {
  korean?: VerseData[]
  english?: VerseData[]
}

function buildRangeLabel(ref: ParsedReference): string {
  if (ref.verseStart === ref.verseEnd) {
    return `${ref.chapter}:${ref.verseStart}`
  }
  return `${ref.chapter}:${ref.verseStart}-${ref.verseEnd}`
}

function buildVerseLines(
  verses: VerseData[],
  isSingle: boolean,
  showVerseNumbers: boolean,
): string[] {
  return verses.map((v) => {
    const number = !isSingle && showVerseNumbers ? `**${v.verse}** ` : ''
    return `${number}${v.text}`
  })
}

export function formatVerses(
  verses: VerseData[],
  ref: ParsedReference,
  settings: BibleSearchSettings,
  extraVerses?: ExtraVerses,
): string {
  const isSingle = ref.verseStart === ref.verseEnd
  const verseLines = buildVerseLines(verses, isSingle, settings.showVerseNumbers)

  const context: TemplateContext = {
    bookKo: ref.bookKo,
    bookEn: ref.bookEn,
    chapter: String(ref.chapter),
    range: buildRangeLabel(ref),
    verses: verseLines,
    version: settings.defaultVersion,
    calloutType: settings.calloutType,
  }

  if (extraVerses?.korean) {
    context.versesKo = buildVerseLines(extraVerses.korean, isSingle, settings.showVerseNumbers)
    context.versionKo = settings.koreanVersion
  }

  if (extraVerses?.english) {
    context.versesEn = buildVerseLines(extraVerses.english, isSingle, settings.showVerseNumbers)
    context.versionEn = settings.englishVersion
  }

  return resolveTemplate(settings.formatTemplate, context)
}
