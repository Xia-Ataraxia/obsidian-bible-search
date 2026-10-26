import { VerseData } from '../types/index'

interface CacheEntry {
  data: VerseData[]
  timestamp: number
}

export class VerseCache {
  private cache = new Map<string, CacheEntry>()
  private ttlMs: number
  private maxEntries: number

  // Bounded so copyrighted text never piles up; it is never written to disk.
  constructor(ttlMinutes: number = 30, maxEntries: number = 20) {
    this.ttlMs = ttlMinutes * 60 * 1000
    this.maxEntries = maxEntries
  }

  private key(version: string, bookNr: number, chapter: number): string {
    return `${version}:${bookNr}:${chapter}`
  }

  get(version: string, bookNr: number, chapter: number): VerseData[] | null {
    const k = this.key(version, bookNr, chapter)
    const entry = this.cache.get(k)
    if (!entry) return null
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(k)
      return null
    }
    return entry.data
  }

  set(version: string, bookNr: number, chapter: number, data: VerseData[]): void {
    const k = this.key(version, bookNr, chapter)
    this.cache.delete(k)
    this.cache.set(k, { data, timestamp: Date.now() })
    // Map keeps insertion order, so the first key is the oldest.
    if (this.cache.size > this.maxEntries) this.cache.delete(this.cache.keys().next().value!)
  }

  clear(): void {
    this.cache.clear()
  }
}
