import { VerseCache } from '../domain/verse-cache'
import { VerseData } from '../types/index'
import { getSource, getSourceVersionCode } from './sources/source-registry'

export async function fetchChapterVerses(
  version: string,
  bookNr: number,
  chapter: number,
  cache: VerseCache,
  cacheEnabled: boolean,
): Promise<VerseData[]> {
  const sourceVersion = getSourceVersionCode(version)
  const source = getSource(version)

  if (cacheEnabled) {
    const cached = cache.get(version, bookNr, chapter)
    if (cached) return cached
  }

  const verses = await source.fetchChapter(sourceVersion, bookNr, chapter)
  // An empty chapter is a failed fetch, not a real chapter with zero verses.
  if (verses.length === 0) throw new Error(`No verses returned for ${version} ${bookNr}:${chapter}`)
  if (cacheEnabled) {
    cache.set(version, bookNr, chapter, verses)
  }
  return verses
}
