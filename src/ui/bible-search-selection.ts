import { ParsedReference } from '../types/index'
import { BibleSuggestion } from './bible-suggestion'

export function getInputValueForSuggestion(value: BibleSuggestion): string | null {
  if (value.type === 'book') {
    return value.book.maxChapter === 1
      ? `${value.book.ko} 1:`
      : `${value.book.ko} `
  }

  if (value.type === 'chapter') {
    return `${value.book.ko} ${value.chapter}:`
  }

  return null
}

export function buildParsedReference(item: Exclude<BibleSuggestion, { type: 'book' | 'chapter' }>): ParsedReference {
  if (item.type === 'verse') {
    return {
      bookNr: item.book.nr,
      bookKo: item.book.ko,
      bookEn: item.book.en,
      chapter: item.chapter,
      verseStart: item.verse,
      verseEnd: item.verse,
    }
  }

  return {
    bookNr: item.book.nr,
    bookKo: item.book.ko,
    bookEn: item.book.en,
    chapter: item.chapter,
    verseStart: item.verseStart,
    verseEnd: item.verseEnd,
  }
}
