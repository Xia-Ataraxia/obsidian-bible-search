import { App, SuggestModal, Editor } from 'obsidian'
import { BibleSuggestion } from './bible-suggestion'
import {
  buildChapterSuggestions,
  buildRangeSuggestion,
  buildVerseSuggestions,
  matchBooks,
  renderBibleSuggestion,
} from './bible-search-suggestions'
import { parseModalInput } from './parse-modal-input'
import { ParsedReference } from '../utils/reference-parser'
import { buildParsedReference, getInputValueForSuggestion } from './bible-search-selection'
import { formatVerses, ExtraVerses } from '../utils/formatter'
import { fetchChapterVerses } from './fetch-chapter-verses'
import { VerseCache } from '../domain/verse-cache'
import { VerseData } from '../types/index'
import { BibleSearchSettings } from '../domain/settings'
import { detectRequiredFetches } from '../utils/resolve-template'
import { FetchTimeoutError } from '../utils/resilient-fetch'
import { PluginNotices } from './plugin-notices'

const PLACEHOLDER = {
  book: 'Type book name (e.g. 요, Genesis, 창세기)',
  chapter: 'Select chapter (e.g. 3)',
  verse: 'Select verse or type range (e.g. 16, 1-3)',
} as const

export class BibleSearchModal extends SuggestModal<BibleSuggestion> {
  private editor: Editor
  private settings: BibleSearchSettings
  private cache: VerseCache
  private notices: PluginNotices
  private chapterCache: { key: string; verses: VerseData[] } | null = null
  private renderCount = 0
  private lastQuery = ''

  constructor(
    app: App,
    editor: Editor,
    settings: BibleSearchSettings,
    cache: VerseCache,
    notices: PluginNotices,
  ) {
    super(app)
    this.editor = editor
    this.settings = settings
    this.cache = cache
    this.notices = notices
    this.setPlaceholder(PLACEHOLDER.book)
  }

  private updatePlaceholder(mode: 'book' | 'chapter' | 'verse'): void {
    this.setPlaceholder(PLACEHOLDER[mode])
  }

  async getSuggestions(query: string): Promise<BibleSuggestion[]> {
    this.renderCount = 0
    // Auto-advance only while typing forward, so backspacing past ":" is not undone.
    const typedForward = query.length > this.lastQuery.length
    this.lastQuery = query
    const state = parseModalInput(query)

    if (state.mode === 'book') {
      this.updatePlaceholder('book')
      return matchBooks(state.query).map(book => ({ type: 'book' as const, book }))
    }

    if (state.mode === 'chapter') {
      this.updatePlaceholder('chapter')
      const chapters = buildChapterSuggestions(state.book, state.filter)
      // Auto-advance when exactly one chapter matches
      if (chapters.length === 1 && typedForward) {
        const only = chapters[0]!
        if (only.type !== 'chapter') return chapters
        const newValue = getInputValueForSuggestion(only)
        if (!newValue) return chapters
        this.inputEl.value = newValue
        this.inputEl.setSelectionRange(newValue.length, newValue.length)
        this.inputEl.dispatchEvent(new Event('input'))
        return []
      }
      return chapters
    }

    // verse mode — async fetch
    this.updatePlaceholder('verse')
    const { book, chapter, filter, rangeEnd } = state
    const cacheKey = `${book.nr}:${chapter}`
    let verses: VerseData[]

    if (this.chapterCache?.key === cacheKey) {
      verses = this.chapterCache.verses
    } else {
      try {
        verses = await fetchChapterVerses(
          this.settings.defaultVersion, book.nr, chapter,
          this.cache, this.settings.cacheEnabled,
        )
      } catch (err) {
        if (err instanceof FetchTimeoutError) {
          this.notices.show('fetch_timeout', { source: 'Bible', seconds: 10 })
        } else {
          this.notices.show('fetch_chapter_failed', {
            bookKo: book.ko,
            chapter,
            error: err instanceof Error ? err.message : String(err),
          })
        }
        return []
      }

      this.chapterCache = { key: cacheKey, verses }
    }

    // Range mode: single item
    if (rangeEnd !== undefined && filter !== '') {
      const verseStart = parseInt(filter, 10)
      return buildRangeSuggestion(book, chapter, verseStart, rangeEnd, verses)
    }

    // Single verse mode
    return buildVerseSuggestions(book, chapter, filter, verses)
  }

  renderSuggestion(item: BibleSuggestion, el: HTMLElement): void {
    const isFirst = this.renderCount === 0
    this.renderCount++
    renderBibleSuggestion(item, el, isFirst)
  }

  selectSuggestion(value: BibleSuggestion, evt: MouseEvent | KeyboardEvent): void {
    const newValue = getInputValueForSuggestion(value)
    if (newValue) {
      this.inputEl.value = newValue
      const len = newValue.length
      this.inputEl.setSelectionRange(len, len)
      this.inputEl.dispatchEvent(new Event('input'))
      return
    }

    // verse or range — close and insert
    super.selectSuggestion(value, evt)
  }

  onChooseSuggestion(item: BibleSuggestion, _evt: MouseEvent | KeyboardEvent): void {
    this.chooseSuggestion(item).catch((err: unknown) => {
      console.error('Failed to insert Bible verse', err)
    })
  }

  private async chooseSuggestion(item: BibleSuggestion): Promise<void> {
    if (item.type === 'book' || item.type === 'chapter') return

    const ref: ParsedReference = buildParsedReference(item)

    try {
      const version = this.settings.defaultVersion
      const cacheKey = `${item.book.nr}:${item.chapter}`

      // Fetch default version verses
      let allVerses: VerseData[] | null = null
      if (this.chapterCache?.key === cacheKey) {
        allVerses = this.chapterCache.verses
      }

      if (!allVerses) {
        allVerses = await fetchChapterVerses(
          version, ref.bookNr, ref.chapter,
          this.cache, this.settings.cacheEnabled,
        )
      }

      const selected = allVerses.filter(v => v.verse >= ref.verseStart && v.verse <= ref.verseEnd)
      if (selected.length === 0) {
        this.notices.show('no_verses_found', {
          bookKo: ref.bookKo,
          chapter: ref.chapter,
          verseStart: ref.verseStart,
          verseEnd: ref.verseEnd,
        })
        return
      }

      // Detect which extra fetches the template needs
      const required = detectRequiredFetches(this.settings.formatTemplate)
      const extraVerses: ExtraVerses = {}
      const fetches: Promise<void>[] = []

      const queueExtraFetch = (
        extraVersion: string,
        assign: (verses: VerseData[]) => void,
      ) => {
        if (extraVersion === version) {
          assign(selected)
        } else {
          fetches.push(
            fetchChapterVerses(extraVersion, ref.bookNr, ref.chapter, this.cache, this.settings.cacheEnabled)
              .then(all => assign(all.filter(v => v.verse >= ref.verseStart && v.verse <= ref.verseEnd))),
          )
        }
      }

      if (required.needsKorean) {
        queueExtraFetch(this.settings.koreanVersion, v => { extraVerses.korean = v })
      }
      if (required.needsEnglish) {
        queueExtraFetch(this.settings.englishVersion, v => { extraVerses.english = v })
      }

      const results = await Promise.allSettled(fetches)
      for (const r of results) {
        if (r.status === 'rejected') {
          this.notices.show('fetch_extra_version_failed', {
            error: r.reason instanceof Error ? r.reason.message : String(r.reason),
          })
        }
      }

      const formatted = formatVerses(selected, ref, this.settings, extraVerses)
      this.editor.replaceSelection(formatted)
    } catch (error) {
      if (error instanceof FetchTimeoutError) {
        this.notices.show('fetch_timeout', { source: 'Bible', seconds: 10 })
      } else {
        this.notices.show('fetch_verse_failed', {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }
}
