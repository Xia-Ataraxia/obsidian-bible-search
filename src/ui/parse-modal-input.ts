import { BibleBookEntry, findBookBestMatch } from '../domain/book-map'

export type ModalInputState =
  | { mode: 'book'; query: string }
  | { mode: 'chapter'; book: BibleBookEntry; filter: string }
  | { mode: 'verse'; book: BibleBookEntry; chapter: number; filter: string; rangeEnd?: number }

// The space after the book is optional ("요3:16") and ranges accept "~" ("1~3").
// Matches: "<book> <digits>" — chapter mode (no colon)
const CHAPTER_ONLY_RE = /^(.+?)\s*(\d+)$/
// Matches: "<book> <digits>:<optional-digits><optional -digits>" — verse mode
const VERSE_RE = /^(.+?)\s*(\d+):(\d*)(?:[-~](\d*))?$/
// Korean suffix patterns: 장/편 (chapter; 편 is used for Psalms), 절 (verse)
const KOREAN_FULL_RE = /^(.+?)\s*(\d+)[장편]\s*(\d+)(?:[-~](\d+))?절$/
const KOREAN_VERSE_ONLY_RE = /^(.+?)\s*(\d+)절$/
const KOREAN_CHAPTER_RE = /^(.+?)\s*(\d+)[장편]$/

/** Try matching a regex and resolving the book from capture group 1. */
function tryMatch(
  text: string,
  re: RegExp,
): { book: BibleBookEntry; groups: RegExpMatchArray } | undefined {
  const m = text.match(re)
  if (!m) return undefined
  const book = findBookBestMatch(m[1]!)
  if (!book) return undefined
  return { book, groups: m }
}

/** Parse a capture group as an integer, returning undefined for missing/empty groups. */
function parseOptionalInt(value: string | undefined): number | undefined {
  return value && value !== '' ? parseInt(value, 10) : undefined
}

export function parseModalInput(input: string): ModalInputState {
  const trimmed = input.trim()

  if (!trimmed) {
    return { mode: 'book', query: '' }
  }

  // Korean full: "요한복음 3장 16절", "요한복음 3장 1-3절"
  const koreanFull = tryMatch(trimmed, KOREAN_FULL_RE)
  if (koreanFull) {
    const { book, groups } = koreanFull
    return {
      mode: 'verse',
      book,
      chapter: parseInt(groups[2]!, 10),
      filter: groups[3]!,
      rangeEnd: parseOptionalInt(groups[4]),
    }
  }

  // Colon-based verse: "요한복음 3:16", "Gen 1:1-5"
  if (trimmed.includes(':')) {
    const verse = tryMatch(trimmed, VERSE_RE)
    if (verse) {
      const { book, groups } = verse
      return {
        mode: 'verse',
        book,
        chapter: parseInt(groups[2]!, 10),
        filter: groups[3] ?? '',
        rangeEnd: parseOptionalInt(groups[4]),
      }
    }
  }

  // Korean verse-only: "요한복음 3절" -> chapter N, show all verses
  const koreanVerseOnly = tryMatch(trimmed, KOREAN_VERSE_ONLY_RE)
  if (koreanVerseOnly) {
    const { book, groups } = koreanVerseOnly
    return { mode: 'verse', book, chapter: parseInt(groups[2]!, 10), filter: '' }
  }

  // Korean chapter: "요한복음 3장"
  const koreanChapter = tryMatch(trimmed, KOREAN_CHAPTER_RE)
  if (koreanChapter) {
    return { mode: 'chapter', book: koreanChapter.book, filter: koreanChapter.groups[2]! }
  }

  // Plain chapter: "창세기 1", "John 3"
  const chapter = tryMatch(trimmed, CHAPTER_ONLY_RE)
  if (chapter) {
    return { mode: 'chapter', book: chapter.book, filter: chapter.groups[2]! }
  }

  // Trailing space after a recognized book: "창세기 " -> chapter mode, empty filter
  if (input.endsWith(' ')) {
    const book = findBookBestMatch(trimmed)
    if (book) {
      return { mode: 'chapter', book, filter: '' }
    }
  }

  // Default: book search mode
  return { mode: 'book', query: trimmed }
}
