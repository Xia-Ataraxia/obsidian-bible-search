import { describe, expect, it, vi } from 'vitest'

import { VerseCache } from '../src/domain/verse-cache'
import { fetchChapterVerses } from '../src/ui/fetch-chapter-verses'

const fetchChapter = vi.fn()
vi.mock('../src/ui/sources/source-registry', () => ({
  getSource: () => ({ fetchChapter }),
  getSourceVersionCode: (v: string) => v,
}))

describe('fetchChapterVerses', () => {
  it('treats an empty chapter as a failed fetch and does not cache it', async () => {
    fetchChapter.mockResolvedValueOnce([])
    const cache = new VerseCache()
    await expect(fetchChapterVerses('GAE', 43, 3, cache, true)).rejects.toThrow('No verses returned')
    expect(cache.get('GAE', 43, 3)).toBeFalsy()
  })

  it('returns and caches a non-empty chapter', async () => {
    const verses = [{ verse: 1, text: 'a' }]
    fetchChapter.mockResolvedValueOnce(verses)
    const cache = new VerseCache()
    await expect(fetchChapterVerses('GAE', 43, 3, cache, true)).resolves.toBe(verses)
    expect(cache.get('GAE', 43, 3)).toBe(verses)
  })
})
