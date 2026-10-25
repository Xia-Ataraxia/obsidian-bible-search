import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from '../src/domain/settings'
import { VerseData } from '../src/types/index'
import { formatVerses } from '../src/utils/formatter'
import { ParsedReference } from '../src/utils/reference-parser'

const GENESIS_1_1: VerseData = { chapter: 1, verse: 1, text: '태초에 하나님이 천지를 창조하시니라' }
const GENESIS_1_2: VerseData = { chapter: 1, verse: 2, text: '땅이 혼돈하고 공허하며...' }
const GENESIS_1_3: VerseData = { chapter: 1, verse: 3, text: '하나님이 이르시되 빛이 있으라 하시니 빛이 있었고' }
const JOHN_3_16: VerseData = { chapter: 3, verse: 16, text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...' }

const JOHN_REF: ParsedReference = { bookNr: 43, bookKo: '요한복음', bookEn: 'John', chapter: 3, verseStart: 16, verseEnd: 16 }
const GEN_1_1_REF: ParsedReference = { bookNr: 1, bookKo: '창세기', bookEn: 'Genesis', chapter: 1, verseStart: 1, verseEnd: 1 }
const GEN_1_1_2_REF: ParsedReference = { bookNr: 1, bookKo: '창세기', bookEn: 'Genesis', chapter: 1, verseStart: 1, verseEnd: 2 }
const GEN_1_1_3_REF: ParsedReference = { bookNr: 1, bookKo: '창세기', bookEn: 'Genesis', chapter: 1, verseStart: 1, verseEnd: 3 }

const CLASSIC_TEMPLATE = '> {bookKo} ({bookEn}) {range}\n> {verses}'

describe('formatVerses', () => {
  it('default template links the chapter and shows the verse reference', () => {
    const result = formatVerses([JOHN_3_16], JOHN_REF, DEFAULT_SETTINGS, { korean: [JOHN_3_16], english: [JOHN_3_16] })
    expect(result.split('\n')[0]).toBe('> [[John 3|John 3:16]]')
  })

  describe('classic blockquote template', () => {
    const classicSettings = { ...DEFAULT_SETTINGS, formatTemplate: CLASSIC_TEMPLATE }

    it('single verse — no verse number even if showVerseNumbers is true', () => {
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        { ...classicSettings, showVerseNumbers: true },
      )
      expect(result).toBe(
        '> 요한복음 (John) 3:16\n> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
      )
    })

    it('single verse — verse range label shows "3:16" not "3:16-16"', () => {
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        classicSettings,
      )
      expect(result).toContain('3:16')
      expect(result).not.toContain('3:16-16')
    })

    it('multi-verse with showVerseNumbers true — prefixes each line with bold number', () => {
      const result = formatVerses(
        [GENESIS_1_1, GENESIS_1_2, GENESIS_1_3],
        GEN_1_1_3_REF,
        { ...classicSettings, showVerseNumbers: true },
      )
      expect(result).toBe(
        '> 창세기 (Genesis) 1:1-3\n' +
        '> **1** 태초에 하나님이 천지를 창조하시니라\n' +
        '> **2** 땅이 혼돈하고 공허하며...\n' +
        '> **3** 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고',
      )
    })

    it('multi-verse with showVerseNumbers false — no verse number prefixes', () => {
      const result = formatVerses(
        [GENESIS_1_1, GENESIS_1_2],
        GEN_1_1_2_REF,
        { ...classicSettings, showVerseNumbers: false },
      )
      expect(result).toBe(
        '> 창세기 (Genesis) 1:1-2\n' +
        '> 태초에 하나님이 천지를 창조하시니라\n' +
        '> 땅이 혼돈하고 공허하며...',
      )
    })

    it('custom callout type via explicit template', () => {
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        { ...classicSettings, formatTemplate: '> [!{calloutType}] {range}\n> {verses}', calloutType: 'quote' },
      )
      expect(result).toContain('[!quote]')
      expect(result).not.toContain('[!bible]')
    })

    it('verse range in title shows "1:1-3" for multi-verse range', () => {
      const result = formatVerses(
        [GENESIS_1_1, GENESIS_1_2, GENESIS_1_3],
        GEN_1_1_3_REF,
        classicSettings,
      )
      expect(result).toContain('1:1-3')
    })
  })

  describe('blockquote-style template', () => {
    const blockquoteSettings = {
      ...DEFAULT_SETTINGS,
      formatTemplate: '> {verses}\n> — {bookKo} ({bookEn}) {range}',
    }

    it('single verse — citation at end, no verse number', () => {
      const result = formatVerses(
        [GENESIS_1_1],
        GEN_1_1_REF,
        { ...blockquoteSettings, showVerseNumbers: true },
      )
      expect(result).toBe(
        '> 태초에 하나님이 천지를 창조하시니라\n' +
        '> — 창세기 (Genesis) 1:1',
      )
    })

    it('multi-verse blockquote with showVerseNumbers true — prefixes and citation', () => {
      const result = formatVerses(
        [GENESIS_1_1, GENESIS_1_2],
        GEN_1_1_2_REF,
        { ...blockquoteSettings, showVerseNumbers: true },
      )
      expect(result).toBe(
        '> **1** 태초에 하나님이 천지를 창조하시니라\n' +
        '> **2** 땅이 혼돈하고 공허하며...\n' +
        '> — 창세기 (Genesis) 1:1-2',
      )
    })

    it('multi-verse blockquote with showVerseNumbers false — no prefixes', () => {
      const result = formatVerses(
        [GENESIS_1_1, GENESIS_1_2],
        GEN_1_1_2_REF,
        { ...blockquoteSettings, showVerseNumbers: false },
      )
      expect(result).toBe(
        '> 태초에 하나님이 천지를 창조하시니라\n' +
        '> 땅이 혼돈하고 공허하며...\n' +
        '> — 창세기 (Genesis) 1:1-2',
      )
    })

    it('verse range in citation shows "1:1-2" for multi-verse', () => {
      const result = formatVerses(
        [GENESIS_1_1, GENESIS_1_2],
        GEN_1_1_2_REF,
        blockquoteSettings,
      )
      expect(result).toContain('1:1-2')
    })
  })

  describe('custom templates', () => {
    it('plain text template without blockquote prefix', () => {
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        { ...DEFAULT_SETTINGS, formatTemplate: '{bookEn} {range}\n{verses}' },
      )
      expect(result).toBe('John 3:16\n하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...')
    })
  })

  describe('extraVerses — bilingual templates', () => {
    const JOHN_EN: VerseData = { chapter: 3, verse: 16, text: 'For God so loved the world...' }
    const GEN_EN_1: VerseData = { chapter: 1, verse: 1, text: 'In the beginning God created...' }
    const GEN_EN_2: VerseData = { chapter: 1, verse: 2, text: 'And the earth was without form...' }

    it('bilingual template with {versesKo} and {versesEn}', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        koreanVersion: 'GAE',
        englishVersion: 'ESV',
        formatTemplate: '> [[{bookEn} {chapter}]]:{range}\n> {versesKo}\n>\n> {versesEn}',
      }
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        settings,
        { korean: [JOHN_3_16], english: [JOHN_EN] },
      )
      expect(result).toBe(
        '> [[John 3]]:3:16\n' +
        '> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...\n' +
        '>\n' +
        '> For God so loved the world...',
      )
    })

    it('extraVerses.korean only — {versesEn} line skipped', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        koreanVersion: 'GAE',
        formatTemplate: '> {versesKo}\n> {versesEn}',
      }
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        settings,
        { korean: [JOHN_3_16] },
      )
      expect(result).toBe(
        '> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
      )
    })

    it('extraVerses with multi-verse applies showVerseNumbers', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        koreanVersion: 'GAE',
        englishVersion: 'ESV',
        showVerseNumbers: true,
        formatTemplate: '> {versesKo}\n> {versesEn}',
      }
      const result = formatVerses(
        [GENESIS_1_1, GENESIS_1_2],
        GEN_1_1_2_REF,
        settings,
        { korean: [GENESIS_1_1, GENESIS_1_2], english: [GEN_EN_1, GEN_EN_2] },
      )
      expect(result).toBe(
        '> **1** 태초에 하나님이 천지를 창조하시니라\n' +
        '> **2** 땅이 혼돈하고 공허하며...\n' +
        '> **1** In the beginning God created...\n' +
        '> **2** And the earth was without form...',
      )
    })

    it('no extraVerses — backward compatible with explicit {verses} template', () => {
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        { ...DEFAULT_SETTINGS, formatTemplate: CLASSIC_TEMPLATE },
      )
      expect(result).toBe(
        '> 요한복음 (John) 3:16\n> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
      )
    })

    it('versionKo and versionEn scalars are populated from settings', () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        koreanVersion: 'KRV',
        englishVersion: 'KJV',
        formatTemplate: '{versionKo} / {versionEn}\n{versesKo}\n{versesEn}',
      }
      const result = formatVerses(
        [JOHN_3_16],
        JOHN_REF,
        settings,
        { korean: [JOHN_3_16], english: [JOHN_EN] },
      )
      expect(result).toBe(
        'KRV / KJV\n' +
        '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...\n' +
        'For God so loved the world...',
      )
    })
  })
})
