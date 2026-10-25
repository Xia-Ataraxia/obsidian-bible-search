import { describe, expect, it } from 'vitest'

import { BIBLE_BOOKS } from '../src/domain/book-map'
import {
  autoAdvanceChapter,
  buildChapterSuggestions,
  buildRangeSuggestion,
  buildVerseSuggestions,
  matchBooks,
  outOfRangeText,
} from '../src/ui/bible-search-suggestions'

const JOHN = BIBLE_BOOKS.find(book => book.ko === '요한복음')!

describe('bible-search-suggestions', () => {
  it('auto-advances a lone chapter only while typing forward', () => {
    const one = buildChapterSuggestions(JOHN, '3').filter(s => s.type === 'chapter' && s.chapter === 3)
    expect(autoAdvanceChapter('요 ', '요 3', one)).toBe(one[0])
    // Backspacing "요한복음 3:" to "요한복음 3" must not jump back to "3:"
    expect(autoAdvanceChapter('요한복음 3:', '요한복음 3', one)).toBeUndefined()
    expect(autoAdvanceChapter('요 ', '요 1', buildChapterSuggestions(JOHN, '1'))).toBeUndefined()
  })

  it('matches books across Korean and English fuzzy queries', () => {
    expect(matchBooks('요')).toEqual(expect.arrayContaining([JOHN]))
    expect(matchBooks('Jhn')).toEqual(expect.arrayContaining([JOHN]))
  })

  it('builds chapter suggestions from prefix filters', () => {
    const suggestions = buildChapterSuggestions(JOHN, '1')
    expect(suggestions[0]).toEqual({ type: 'chapter', book: JOHN, chapter: 1 })
    expect(suggestions.every(item => item.type === 'chapter' && String(item.chapter).startsWith('1'))).toBe(true)
  })

  it('builds a truncated range preview when verses are present', () => {
    const suggestions = buildRangeSuggestion(JOHN, 3, 16, 17, [
      { chapter: 3, verse: 16, text: 'A'.repeat(40) },
      { chapter: 3, verse: 17, text: 'B'.repeat(40) },
    ])
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toMatchObject({
      type: 'range',
      book: JOHN,
      chapter: 3,
      verseStart: 16,
      verseEnd: 17,
    })
    if (suggestions[0]?.type === 'range') {
      expect(suggestions[0].preview.endsWith('...')).toBe(true)
    }
  })

  it('filters and truncates verse suggestions', () => {
    const suggestions = buildVerseSuggestions(JOHN, 3, '1', [
      { chapter: 3, verse: 1, text: 'short' },
      { chapter: 3, verse: 16, text: 'C'.repeat(80) },
      { chapter: 3, verse: 8, text: 'ignored' },
    ])
    expect(suggestions).toHaveLength(2)
    expect(suggestions[0]).toMatchObject({ type: 'verse', verse: 1, text: 'short' })
    expect(suggestions[1]).toMatchObject({ type: 'verse', verse: 16 })
    if (suggestions[1]?.type === 'verse') {
      expect(suggestions[1].text.endsWith('...')).toBe(true)
    }
  })

  it('normalizes reversed ranges and clamps to existing verses', () => {
    const verses = [35, 36].map(verse => ({ chapter: 3, verse, text: 'x' }))
    expect(buildRangeSuggestion(JOHN, 3, 35, 99, verses)[0]).toMatchObject({ verseStart: 35, verseEnd: 36 })
    expect(buildRangeSuggestion(JOHN, 3, 36, 35, verses)[0]).toMatchObject({ verseStart: 35, verseEnd: 36 })
    expect(buildRangeSuggestion(JOHN, 3, 40, 50, verses)).toEqual([])
  })

  it('describes references past the end of the book or chapter', () => {
    const verses = [1, 2, 36].map(verse => ({ chapter: 3, verse, text: '' }))
    expect(outOfRangeText(JOHN, 30)).toBe('요한복음은 21장까지 있습니다')
    expect(outOfRangeText(JOHN, 3, verses)).toBe('요한복음 3장은 36절까지 있습니다')
    expect(outOfRangeText(BIBLE_BOOKS[0]!, 51)).toBe('창세기는 50장까지 있습니다')
    expect(outOfRangeText(BIBLE_BOOKS[18]!, 151)).toBe('시편은 150편까지 있습니다')
  })
})
