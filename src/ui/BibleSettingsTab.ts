import { App, PluginSettingTab, type SettingDefinitionItem } from 'obsidian'
import { SUPPORTED_VERSIONS } from './sources/source-registry'
import { DEFAULT_FORMAT_TEMPLATE } from '../domain/settings'
import type { BibleSearchSettings } from '../domain/settings'
import type BibleSearchPlugin from '../main'

const versionOptions = (language?: string): Record<string, string> =>
  Object.fromEntries(
    SUPPORTED_VERSIONS.filter(v => !language || v.language === language).map(v => [v.code, v.label]),
  )

const EMPTY_FALLBACKS: Partial<Record<keyof BibleSearchSettings, string>> = {
  formatTemplate: DEFAULT_FORMAT_TEMPLATE,
  calloutType: 'bible',
}

export class BibleSettingsTab extends PluginSettingTab {
  plugin: BibleSearchPlugin

  constructor(app: App, plugin: BibleSearchPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }


  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: 'Default version (기본 역본)',
        desc: 'Select the default Bible version for searches and {verses} token.',
        control: { type: 'dropdown', key: 'defaultVersion', options: versionOptions() },
      },
      {
        name: 'Korean version',
        desc: 'Korean version for {versesKo} token.',
        control: { type: 'dropdown', key: 'koreanVersion', options: versionOptions('ko') },
      },
      {
        name: 'English version',
        desc: 'English version for {versesEn} token.',
        control: { type: 'dropdown', key: 'englishVersion', options: versionOptions('en') },
      },
      {
        name: 'Format template',
        desc:
          'Template for inserted verses. Available tokens: ' +
          '{bookKo}, {bookEn}, {chapter}, {range}, {verses}, {versesKo}, {versesEn}, ' +
          '{version}, {versionKo}, {versionEn}, {calloutType}.',
        control: { type: 'textarea', key: 'formatTemplate', placeholder: DEFAULT_FORMAT_TEMPLATE, rows: 4 },
      },
      {
        name: 'Callout type',
        desc: 'The callout type identifier used by {calloutType} token (e.g. bible, quote).',
        control: { type: 'text', key: 'calloutType', placeholder: 'bible' },
      },
      {
        name: 'Show verse numbers',
        desc: 'Show verse numbers when inserting multiple verses.',
        control: { type: 'toggle', key: 'showVerseNumbers' },
      },
      {
        name: 'Enable cache',
        desc: 'Cache fetched chapters in memory.',
        control: { type: 'toggle', key: 'cacheEnabled' },
      },
      {
        // Fulfils the "Undo in settings" promise of the mute button.
        name: 'Restore muted notices',
        desc: 'Show notices hidden with the mute button again.',
        visible: () => this.plugin.notices.listMuted().length > 0,
        render: setting => {
          setting.addButton(button => button
            .setButtonText('Restore')
            .onClick(() => {
              void this.plugin.notices.unmuteAll().then(() => this.update())
            }))
        },
      },
    ]
  }

  getControlValue(key: string): unknown {
    return this.plugin.settings[key as keyof BibleSearchSettings]
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    const settingKey = key as keyof BibleSearchSettings
    const settings: Record<string, unknown> = this.plugin.settings
    settings[settingKey] = value === '' ? EMPTY_FALLBACKS[settingKey] ?? value : value
    if (settingKey === 'cacheEnabled' && value === false) this.plugin.cache.clear()
    await this.plugin.saveSettings()
  }
}
