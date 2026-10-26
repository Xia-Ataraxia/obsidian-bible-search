import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VerseCache } from '../src/domain/verse-cache'
import type { VerseData } from '../src/types/index'

const sampleVerses: VerseData[] = [
  { chapter: 1, verse: 1, text: 'In the beginning God created the heavens and the earth.' },
  { chapter: 1, verse: 2, text: 'The earth was without form and void.' },
]

describe('VerseCache', () => {
  let cache: VerseCache

  beforeEach(() => {
    vi.useFakeTimers()
    cache = new VerseCache(30)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null for a missing entry', () => {
    expect(cache.get('KJV', 1, 1)).toBeNull()
  })

  it('returns data after set', () => {
    cache.set('KJV', 1, 1, sampleVerses)
    expect(cache.get('KJV', 1, 1)).toEqual(sampleVerses)
  })

  it('returns null for an expired entry', () => {
    cache.set('KJV', 1, 1, sampleVerses)
    vi.advanceTimersByTime(31 * 60 * 1000)
    expect(cache.get('KJV', 1, 1)).toBeNull()
  })

  it('clear removes all entries', () => {
    cache.set('KJV', 1, 1, sampleVerses)
    cache.set('KRV', 1, 1, sampleVerses)
    cache.clear()
    expect(cache.get('KJV', 1, 1)).toBeNull()
    expect(cache.get('KRV', 1, 1)).toBeNull()
  })

  it('different keys do not interfere', () => {
    const altVerses: VerseData[] = [{ chapter: 2, verse: 1, text: 'Different verse.' }]
    cache.set('KJV', 1, 1, sampleVerses)
    cache.set('KJV', 1, 2, altVerses)
    expect(cache.get('KJV', 1, 1)).toEqual(sampleVerses)
    expect(cache.get('KJV', 1, 2)).toEqual(altVerses)
    expect(cache.get('KRV', 1, 1)).toBeNull()
  })

  it('evicts the oldest chapter past the entry cap', () => {
    const small = new VerseCache(30, 2)
    small.set('KJV', 1, 1, sampleVerses)
    small.set('KJV', 1, 2, sampleVerses)
    small.set('KJV', 1, 3, sampleVerses)
    expect(small.get('KJV', 1, 1)).toBeNull()
    expect(small.get('KJV', 1, 3)).toEqual(sampleVerses)
  })
})
