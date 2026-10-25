import { describe, it, expect } from 'vitest'
import { parseModalInput } from '../src/ui/parse-modal-input'

describe('parseModalInput', () => {
  describe('book mode', () => {
    it('returns book mode for empty string', () => {
      const result = parseModalInput('')
      expect(result.mode).toBe('book')
      if (result.mode === 'book') expect(result.query).toBe('')
    })

    it('returns book mode with query for partial Korean', () => {
      const result = parseModalInput('창')
      expect(result.mode).toBe('book')
      if (result.mode === 'book') expect(result.query).toBe('창')
    })

    it('returns book mode for partial English', () => {
      const result = parseModalInput('Gen')
      expect(result.mode).toBe('book')
      if (result.mode === 'book') expect(result.query).toBe('Gen')
    })

    it('returns book mode for unrecognized text with digits', () => {
      const result = parseModalInput('xyz 3')
      expect(result.mode).toBe('book')
    })

    it('returns book mode for unrecognized text with colon', () => {
      const result = parseModalInput('xyz 3:16')
      expect(result.mode).toBe('book')
    })
  })

  describe('chapter mode', () => {
    it('returns chapter mode when exact Korean full name followed by space', () => {
      const result = parseModalInput('창세기 ')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('창세기')
        expect(result.filter).toBe('')
      }
    })

    it('returns chapter mode when exact Korean abbr followed by space', () => {
      const result = parseModalInput('요 ')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.filter).toBe('')
      }
    })

    it('returns chapter mode with filter for "창세기 1"', () => {
      const result = parseModalInput('창세기 1')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('창세기')
        expect(result.filter).toBe('1')
      }
    })

    it('returns chapter mode with filter for "요한복음 3"', () => {
      const result = parseModalInput('요한복음 3')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.filter).toBe('3')
      }
    })

    it('returns chapter mode for multi-digit chapter filter', () => {
      const result = parseModalInput('시편 10')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('시편')
        expect(result.filter).toBe('10')
      }
    })

    it('returns chapter mode for English book name', () => {
      const result = parseModalInput('John 3')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.en).toBe('John')
        expect(result.filter).toBe('3')
      }
    })

    it('returns chapter mode for English abbreviation', () => {
      const result = parseModalInput('Gen 1')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.nr).toBe(1)
        expect(result.filter).toBe('1')
      }
    })
  })

  describe('verse mode', () => {
    it('returns verse mode for "창세기 1:" with empty filter', () => {
      const result = parseModalInput('창세기 1:')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('창세기')
        expect(result.chapter).toBe(1)
        expect(result.filter).toBe('')
        expect(result.rangeEnd).toBeUndefined()
      }
    })

    it('returns verse mode for "요 3:16" with filter "16"', () => {
      const result = parseModalInput('요 3:16')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('16')
        expect(result.rangeEnd).toBeUndefined()
      }
    })

    it('returns verse mode with rangeEnd for "요 3:16-18"', () => {
      const result = parseModalInput('요 3:16-18')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('16')
        expect(result.rangeEnd).toBe(18)
      }
    })

    it('returns verse mode for "John 3:16"', () => {
      const result = parseModalInput('John 3:16')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.en).toBe('John')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('16')
      }
    })

    it('returns verse mode for "Gen 1:1-5" with range', () => {
      const result = parseModalInput('Gen 1:1-5')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.nr).toBe(1)
        expect(result.chapter).toBe(1)
        expect(result.filter).toBe('1')
        expect(result.rangeEnd).toBe(5)
      }
    })

    it('returns verse mode for "요한복음 3:" with empty filter', () => {
      const result = parseModalInput('요한복음 3:')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('')
      }
    })

    it('returns verse mode for single-char abbreviation with verse "요 1:1"', () => {
      const result = parseModalInput('요 1:1')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.koAbbr).toBe('요')
        expect(result.chapter).toBe(1)
        expect(result.filter).toBe('1')
      }
    })

    it('returns verse mode for multi-char Korean abbr "고전 13:4"', () => {
      const result = parseModalInput('고전 13:4')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.nr).toBe(46)
        expect(result.chapter).toBe(13)
        expect(result.filter).toBe('4')
      }
    })

    it('returns verse mode for partial range "요 3:16-" with undefined rangeEnd', () => {
      const result = parseModalInput('요 3:16-')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.filter).toBe('16')
        expect(result.rangeEnd).toBeUndefined()
      }
    })
  })

  describe('Korean chapter suffix (장)', () => {
    it('returns chapter mode for "요한복음 3장"', () => {
      const result = parseModalInput('요한복음 3장')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.filter).toBe('3')
      }
    })

    it('returns chapter mode for "창세기 10장"', () => {
      const result = parseModalInput('창세기 10장')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('창세기')
        expect(result.filter).toBe('10')
      }
    })

    it('returns chapter mode for abbreviation "요 3장"', () => {
      const result = parseModalInput('요 3장')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.filter).toBe('3')
      }
    })
  })

  describe('Korean full suffix (장 절)', () => {
    it('returns verse mode for "요한복음 3장 16절"', () => {
      const result = parseModalInput('요한복음 3장 16절')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('16')
        expect(result.rangeEnd).toBeUndefined()
      }
    })

    it('returns verse mode with range for "요한복음 3장 1-3절"', () => {
      const result = parseModalInput('요한복음 3장 1-3절')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('1')
        expect(result.rangeEnd).toBe(3)
      }
    })

    it('returns verse mode for mixed "Gen 3장 16절"', () => {
      const result = parseModalInput('Gen 3장 16절')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.nr).toBe(1)
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('16')
      }
    })
  })

  describe('Korean verse-only suffix (절)', () => {
    it('returns verse mode for "요한복음 3절"', () => {
      const result = parseModalInput('요한복음 3절')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('')
      }
    })

    it('returns verse mode for abbreviation "창 1절"', () => {
      const result = parseModalInput('창 1절')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('창세기')
        expect(result.chapter).toBe(1)
        expect(result.filter).toBe('')
      }
    })
  })

  describe('prefix matching in parse', () => {
    it('returns chapter mode for prefix match "Genesi 1"', () => {
      const result = parseModalInput('Genesi 1')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.en).toBe('Genesis')
        expect(result.filter).toBe('1')
      }
    })

    it('returns verse mode for prefix match "요한복 3:"', () => {
      const result = parseModalInput('요한복 3:')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.ko).toBe('요한복음')
        expect(result.chapter).toBe(3)
        expect(result.filter).toBe('')
      }
    })

    it('falls through to book mode when prefix is ambiguous "요한 3"', () => {
      const result = parseModalInput('요한 3')
      expect(result.mode).toBe('book')
    })
  })

  describe('single-chapter books', () => {
    it('parses 오바댜 (maxChapter=1) in chapter filter mode', () => {
      const result = parseModalInput('오바댜 ')
      expect(result.mode).toBe('chapter')
      if (result.mode === 'chapter') {
        expect(result.book.maxChapter).toBe(1)
      }
    })

    it('parses 빌레몬서 1: as verse mode', () => {
      const result = parseModalInput('빌레몬서 1:')
      expect(result.mode).toBe('verse')
      if (result.mode === 'verse') {
        expect(result.book.maxChapter).toBe(1)
        expect(result.chapter).toBe(1)
      }
    })
  })

  describe('compact references', () => {
    it.each([
      ['요3:16', 'John', 3, '16', undefined],
      ['John3:16', 'John', 3, '16', undefined],
      ['창1:1~3', 'Genesis', 1, '1', 3],
      ['요 3:16~18', 'John', 3, '16', 18],
      ['요한복음3장16~18절', 'John', 3, '16', 18],
      ['1 John 1:1', '1 John', 1, '1', undefined],
    ])('parses %s', (input, bookEn, chapter, filter, rangeEnd) => {
      expect(parseModalInput(input)).toMatchObject({ mode: 'verse', book: { en: bookEn }, chapter, filter, rangeEnd })
    })

    it('parses "요3" and "요3장" as chapter mode', () => {
      expect(parseModalInput('요3')).toMatchObject({ mode: 'chapter', book: { en: 'John' }, filter: '3' })
      expect(parseModalInput('요3장')).toMatchObject({ mode: 'chapter', book: { en: 'John' }, filter: '3' })
    })
  })
})
