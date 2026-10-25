import { BibleBookEntry, BIBLE_BOOKS } from '../domain/book-map'
import { VerseData } from '../types/index'
import { BibleSuggestion } from './bible-suggestion'

const PREVIEW_MAX_LEN = 60

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (q[qi] === t[ti]) qi++
  }
  return qi === q.length
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

export function matchBooks(query: string): BibleBookEntry[] {
  if (!query) return BIBLE_BOOKS
  return BIBLE_BOOKS.filter(
    b =>
      fuzzyMatch(query, b.ko) ||
      fuzzyMatch(query, b.koAbbr) ||
      fuzzyMatch(query, b.en) ||
      fuzzyMatch(query, b.enAbbr),
  )
}

export function buildChapterSuggestions(
  book: BibleBookEntry,
  filter: string,
): BibleSuggestion[] {
  const items: BibleSuggestion[] = []
  for (let ch = 1; ch <= book.maxChapter; ch++) {
    if (filter === '' || String(ch).startsWith(filter)) {
      items.push({ type: 'chapter', book, chapter: ch })
    }
  }
  return items
}

/** The lone chapter match to jump to; only while typing forward, so backspacing past ":" sticks. */
export function autoAdvanceChapter(
  prevQuery: string,
  query: string,
  chapters: BibleSuggestion[],
): BibleSuggestion | undefined {
  if (query.length <= prevQuery.length || chapters.length !== 1) return undefined
  return chapters[0]?.type === 'chapter' ? chapters[0] : undefined
}

/** Topic particle 은/는, chosen by whether the last Hangul syllable has a final consonant. */
function topic(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code < 11172 && code % 28 === 0 ? '는' : '은'
}

/** Empty-state text for a reference past the end of the book or chapter. */
export function outOfRangeText(book: BibleBookEntry, chapter: number, verses?: VerseData[]): string {
  // Psalms count 편, every other book 장.
  const unit = book.nr === 19 ? '편' : '장'
  if (chapter < 1 || chapter > book.maxChapter) return `${book.ko}${topic(book.ko)} ${book.maxChapter}${unit}까지 있습니다`
  const last = verses?.[verses.length - 1]?.verse ?? 0
  return `${book.ko} ${chapter}${unit}은 ${last}절까지 있습니다`
}

export function buildRangeSuggestion(
  book: BibleBookEntry,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  verses: VerseData[],
): BibleSuggestion[] {
  const lo = Math.min(verseStart, verseEnd)
  const hi = Math.max(verseStart, verseEnd)
  const selected = verses.filter(v => v.verse >= lo && v.verse <= hi)
  if (selected.length === 0) return []
  const preview = selected.map(v => v.text).join(' ')
  // Clamp to verses that exist so "3:35-99" is labelled "3:35-36".
  return [{
    type: 'range',
    book,
    chapter,
    verseStart: selected[0]!.verse,
    verseEnd: selected[selected.length - 1]!.verse,
    preview: truncate(preview, PREVIEW_MAX_LEN),
  }]
}

export function buildVerseSuggestions(
  book: BibleBookEntry,
  chapter: number,
  filter: string,
  verses: VerseData[],
): BibleSuggestion[] {
  return verses
    .filter(v => filter === '' || String(v.verse).startsWith(filter))
    .map(v => ({
      type: 'verse' as const,
      book,
      chapter,
      verse: v.verse,
      text: truncate(v.text, PREVIEW_MAX_LEN),
    }))
}

export function renderBibleSuggestion(
  item: BibleSuggestion,
  el: HTMLElement,
  isFirst: boolean,
): void {
  el.addClass('bible-search-suggestion')
  if (item.type === 'book') {
    el.createSpan( { text: `${item.book.ko} (${item.book.en})` })
    if (isFirst) el.createSpan( { text: 'Enter to select', cls: 'bible-search-hint' })
    return
  }
  if (item.type === 'chapter') {
    el.createSpan( { text: `${item.chapter}장` })
    if (isFirst) el.createSpan( { text: 'Enter to select', cls: 'bible-search-hint' })
    return
  }
  if (item.type === 'verse') {
    el.createSpan( { text: `${item.verse}절  ${item.text}` })
    if (isFirst) el.createSpan( { text: 'Enter to insert', cls: 'bible-search-hint' })
    return
  }
  const label = item.verseStart === item.verseEnd ? `${item.verseStart}` : `${item.verseStart}-${item.verseEnd}`
  el.createSpan( { text: `${label}절  ${item.preview}` })
  if (isFirst) el.createSpan( { text: 'Enter to insert', cls: 'bible-search-hint' })
}
