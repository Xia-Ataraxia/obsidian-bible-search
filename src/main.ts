import { Editor, Notice, Plugin } from 'obsidian'
import { BibleSearchSettings, DEFAULT_FORMAT_TEMPLATE, DEFAULT_SETTINGS } from './domain/settings'
import { BibleSearchModal } from './ui/BibleSearchModal'
import { BibleSettingsTab } from './ui/BibleSettingsTab'
import { VerseCache } from './domain/verse-cache'
import { PluginLogger } from './ui/plugin-logger'
import { PluginNotices } from './ui/plugin-notices'
import type { NoticeCatalog } from './ui/plugin-notice-types'
import { migrateSettings } from './domain/settings-migration'

const logger = new PluginLogger('bible-search')

const NOTICE_CATALOG: NoticeCatalog = {
  load_settings_failed: {
    template: 'Failed to load settings. Using defaults.',
    timeout: 6000,
  },
  save_settings_failed: {
    template: 'Failed to save settings.',
    timeout: 6000,
  },
  fetch_chapter_failed: {
    template: 'Failed to fetch {{bookKo}} {{chapter}}: {{error}}',
    timeout: 6000,
  },
  no_verses_found: {
    template: 'No verses found for {{bookKo}} {{chapter}}:{{verseStart}}-{{verseEnd}}',
    timeout: 5000,
  },
  fetch_extra_version_failed: {
    template: 'Failed to fetch extra version: {{error}}',
    timeout: 6000,
  },
  fetch_verse_failed: {
    template: 'Failed to fetch verse: {{error}}',
    timeout: 6000,
  },
  fetch_timeout: {
    template: '{{source}} server timed out after {{seconds}}s — retrying may help',
    timeout: 6000,
  },
}

export default class BibleSearchPlugin extends Plugin {
  settings!: BibleSearchSettings
  cache!: VerseCache
  notices!: PluginNotices

  async onload(): Promise<void> {
    await this.loadSettings()
    this.notices = new PluginNotices(this, NOTICE_CATALOG, 'Bible')
    this.cache = new VerseCache(this.settings.cacheTtlMinutes)

    this.addCommand({
      id: 'search-bible-verse',
      name: 'Search verse',
      editorCallback: (editor: Editor) => {
        new BibleSearchModal(this.app, editor, this.settings, this.cache, this.notices).open()
      },
    })

    this.addSettingTab(new BibleSettingsTab(this.app, this))
  }

  onunload(): void {
    this.notices?.unload()
  }

  async loadSettings(): Promise<void> {
    let raw: Record<string, unknown> = {}
    try {
      raw = ((await this.loadData()) as Record<string, unknown> | null) ?? {}
    } catch (err) {
      logger.error('Failed to load settings, using defaults', err)
      // PluginNotices is not yet initialised at this stage; fall back to a bare Notice.
      new Notice('Failed to load settings. Using defaults.')
    }

    const migrations = [
      (data: Record<string, unknown>): Record<string, unknown> => {
        if ('outputFormat' in data && !('formatTemplate' in data)) {
          const result = { ...data }
          if (data.outputFormat === 'blockquote') {
            result.formatTemplate = '> {verses}\n> — {bookKo} ({bookEn}) {range}'
          } else if (data.outputFormat !== 'callout') {
            logger.warn(`Unknown outputFormat "${String(data.outputFormat)}", using default template`)
            result.formatTemplate = DEFAULT_FORMAT_TEMPLATE
          }
          delete result.outputFormat
          return result
        }
        return data
      },
    ]

    const { data, changed } = migrateSettings(raw, migrations)
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data)

    if (changed) {
      try {
        await this.saveData(this.settings)
      } catch (err) {
        logger.error('Failed to persist migration', err)
      }
    }
  }

  async saveSettings(): Promise<void> {
    try {
      await this.saveData(this.settings)
    } catch (err) {
      logger.error('Failed to save settings', err)
      this.notices.show('save_settings_failed')
    }
  }
}
