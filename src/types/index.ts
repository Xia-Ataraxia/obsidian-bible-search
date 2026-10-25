export interface VerseData {
  chapter: number
  verse: number
  text: string
}

export interface ParsedReference {
  bookNr: number
  bookKo: string
  bookEn: string
  chapter: number
  verseStart: number
  verseEnd: number
}

export interface BibleSource {
  fetchChapter(versionCode: string, bookNr: number, chapter: number): Promise<VerseData[]>
}
