import { describe, expect, it } from 'vitest'
import { resolveTemplate, TemplateContext, detectRequiredFetches } from '../src/utils/resolve-template'

const BASE_CTX: TemplateContext = {
  bookKo: '요한복음',
  bookEn: 'John',
  chapter: '3',
  range: '3:16',
  verses: ['하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...'],
  version: 'GAE',
  calloutType: 'bible',
}

const MULTI_VERSE_CTX: TemplateContext = {
  bookKo: '창세기',
  bookEn: 'Genesis',
  chapter: '1',
  range: '1:1-3',
  verses: [
    '**1** 태초에 하나님이 천지를 창조하시니라',
    '**2** 땅이 혼돈하고 공허하며...',
    '**3** 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고',
  ],
  version: 'GAE',
  calloutType: 'bible',
}

describe('resolveTemplate', () => {
  it('single verse with callout template', () => {
    const template = '> [!{calloutType}] {bookKo} ({bookEn}) {range}\n> {verses}'
    const result = resolveTemplate(template, BASE_CTX)
    expect(result).toBe(
      '> [!bible] 요한복음 (John) 3:16\n' +
      '> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
    )
  })

  it('multi-verse with > prefix inheritance', () => {
    const template = '> [!{calloutType}] {bookKo} ({bookEn}) {range}\n> {verses}'
    const result = resolveTemplate(template, MULTI_VERSE_CTX)
    expect(result).toBe(
      '> [!bible] 창세기 (Genesis) 1:1-3\n' +
      '> **1** 태초에 하나님이 천지를 창조하시니라\n' +
      '> **2** 땅이 혼돈하고 공허하며...\n' +
      '> **3** 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고',
    )
  })

  it('blockquote-style template with citation at end', () => {
    const template = '> {verses}\n> — {bookKo} ({bookEn}) {range}'
    const result = resolveTemplate(template, BASE_CTX)
    expect(result).toBe(
      '> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...\n' +
      '> — 요한복음 (John) 3:16',
    )
  })

  it('plain text template — no prefix on verses', () => {
    const template = '{bookKo} {range}\n{verses}'
    const result = resolveTemplate(template, MULTI_VERSE_CTX)
    expect(result).toBe(
      '창세기 1:1-3\n' +
      '**1** 태초에 하나님이 천지를 창조하시니라\n' +
      '**2** 땅이 혼돈하고 공허하며...\n' +
      '**3** 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고',
    )
  })

  it('empty/whitespace template falls back to default', () => {
    const ctx: TemplateContext = {
      ...BASE_CTX,
      versesKo: ['하나님이 세상을 사랑하사...'],
      versesEn: ['For God so loved the world...'],
    }
    const result = resolveTemplate('   ', ctx)
    expect(result).toBe(
      '> [[John 3|John 3:16]]\n' +
      '> 하나님이 세상을 사랑하사...\n' +
      '>\n' +
      '> For God so loved the world...',
    )
  })

  it('unknown tokens are left as-is', () => {
    const template = '{bookKo} {unknownToken} {range}\n{verses}'
    const result = resolveTemplate(template, BASE_CTX)
    expect(result).toContain('{unknownToken}')
  })

  it('version token is replaced', () => {
    const template = '{bookKo} {range} ({version})\n{verses}'
    const result = resolveTemplate(template, BASE_CTX)
    expect(result).toContain('(GAE)')
  })

  it('suffix after {verses} is preserved on each line', () => {
    const template = '| {verses} |'
    const result = resolveTemplate(template, MULTI_VERSE_CTX)
    expect(result).toBe(
      '| **1** 태초에 하나님이 천지를 창조하시니라 |\n' +
      '| **2** 땅이 혼돈하고 공허하며... |\n' +
      '| **3** 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고 |',
    )
  })
})

describe('resolveTemplate — {versesKo} / {versesEn}', () => {
  it('expands {versesKo} when provided', () => {
    const ctx: TemplateContext = {
      ...BASE_CTX,
      versesKo: ['하나님이 세상을 사랑하사...'],
      versionKo: 'GAE',
    }
    const template = '> {versesKo}\n> — {bookKo} {range} ({versionKo})'
    const result = resolveTemplate(template, ctx)
    expect(result).toBe(
      '> 하나님이 세상을 사랑하사...\n' +
      '> — 요한복음 3:16 (GAE)',
    )
  })

  it('expands {versesEn} when provided', () => {
    const ctx: TemplateContext = {
      ...BASE_CTX,
      versesEn: ['For God so loved the world...'],
      versionEn: 'ESV',
    }
    const template = '> {versesEn}\n> — {bookEn} {range} ({versionEn})'
    const result = resolveTemplate(template, ctx)
    expect(result).toBe(
      '> For God so loved the world...\n' +
      '> — John 3:16 (ESV)',
    )
  })

  it('mixed bilingual template', () => {
    const ctx: TemplateContext = {
      ...BASE_CTX,
      versesKo: ['하나님이 세상을 사랑하사...'],
      versesEn: ['For God so loved the world...'],
      versionKo: 'GAE',
      versionEn: 'ESV',
    }
    const template = '> [[{bookEn} {chapter}]]:{range}\n> {versesKo}\n>\n> {versesEn}'
    const result = resolveTemplate(template, ctx)
    expect(result).toBe(
      '> [[John 3]]:3:16\n' +
      '> 하나님이 세상을 사랑하사...\n' +
      '>\n' +
      '> For God so loved the world...',
    )
  })

  it('silently skips {versesKo} line when versesKo is undefined', () => {
    const template = '> {versesKo}\n> {verses}'
    const result = resolveTemplate(template, BASE_CTX)
    expect(result).toBe(
      '> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
    )
  })

  it('silently skips {versesEn} line when versesEn is undefined', () => {
    const template = '> {verses}\n> {versesEn}'
    const result = resolveTemplate(template, BASE_CTX)
    expect(result).toBe(
      '> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
    )
  })

  it('backward compat: {verses} still works without new tokens', () => {
    const template = '> {verses}'
    const result = resolveTemplate(template, BASE_CTX)
    expect(result).toBe(
      '> 하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...',
    )
  })

  it('{versionKo} and {versionEn} scalar tokens are replaced', () => {
    const ctx: TemplateContext = {
      ...BASE_CTX,
      versesKo: ['text'],
      versesEn: ['text'],
      versionKo: 'KRV',
      versionEn: 'KJV',
    }
    const template = '{versionKo} / {versionEn}\n{versesKo}\n{versesEn}'
    const result = resolveTemplate(template, ctx)
    expect(result).toBe('KRV / KJV\ntext\ntext')
  })
})

describe('detectRequiredFetches', () => {
  it('detects {verses} only', () => {
    const result = detectRequiredFetches('> {bookKo} {range}\n> {verses}')
    expect(result).toEqual({ needsDefault: true, needsKorean: false, needsEnglish: false })
  })

  it('detects {versesKo} only', () => {
    const result = detectRequiredFetches('> {versesKo}')
    expect(result).toEqual({ needsDefault: false, needsKorean: true, needsEnglish: false })
  })

  it('detects {versesEn} only', () => {
    const result = detectRequiredFetches('> {versesEn}')
    expect(result).toEqual({ needsDefault: false, needsKorean: false, needsEnglish: true })
  })

  it('detects all three tokens', () => {
    const result = detectRequiredFetches('> {versesKo}\n> {versesEn}\n> {verses}')
    expect(result).toEqual({ needsDefault: true, needsKorean: true, needsEnglish: true })
  })

  it('returns all false for template with no verse tokens', () => {
    const result = detectRequiredFetches('{bookKo} {range}')
    expect(result).toEqual({ needsDefault: false, needsKorean: false, needsEnglish: false })
  })

  it('does not false-positive {versesKo} when only {verses} present', () => {
    const result = detectRequiredFetches('> {verses}')
    expect(result.needsKorean).toBe(false)
    expect(result.needsEnglish).toBe(false)
  })

  it('does not false-positive {verses} when only {versesKo}/{versesEn} present', () => {
    const result = detectRequiredFetches('> {versesKo}\n> {versesEn}')
    expect(result.needsDefault).toBe(false)
    expect(result.needsKorean).toBe(true)
    expect(result.needsEnglish).toBe(true)
  })
})
