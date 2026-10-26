import { App, PluginSettingTab, debounce, type SettingDefinitionItem } from 'obsidian'
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
  // Text controls call setControlValue per keystroke; coalesce the disk writes.
  private readonly saveSoon = debounce(() => { void this.plugin.saveSettings() }, 500, true)

  constructor(app: App, plugin: BibleSearchPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: 'group',
        items: [
          {
            name: 'Default version',
            desc: 'Bible version for search results and the {verses} token.',
            control: { type: 'dropdown', key: 'defaultVersion', options: versionOptions() },
          },
          {
            name: 'Korean version',
            desc: 'Korean version for the {versesKo} token.',
            control: { type: 'dropdown', key: 'koreanVersion', options: versionOptions('ko') },
          },
          {
            name: 'English version',
            desc: 'English version for the {versesEn} token.',
            control: { type: 'dropdown', key: 'englishVersion', options: versionOptions('en') },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Insert format',
        cls: 'bible-search-format-group',
        items: [
          {
            name: 'Format template',
            desc:
              'Template for inserted verses. Available tokens: ' +
              '{bookKo}, {bookEn}, {chapter}, {range}, {verses}, {versesKo}, {versesEn}, ' +
              '{version}, {versionKo}, {versionEn}, {calloutType}.',
            control: { type: 'textarea', key: 'formatTemplate', placeholder: DEFAULT_FORMAT_TEMPLATE, rows: 5 },
          },
          {
            name: 'Callout type',
            desc: 'Fills the {calloutType} token, e.g. bible or quote.',
            visible: () => this.usesCalloutType(),
            control: { type: 'text', key: 'calloutType', placeholder: 'bible' },
          },
          {
            name: 'Show verse numbers',
            desc: 'Number each verse when inserting more than one.',
            control: { type: 'toggle', key: 'showVerseNumbers' },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Advanced',
        items: [
          {
            name: 'Enable cache',
            desc: 'Keep fetched chapters in memory so repeat searches are instant.',
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
        ],
      },
    ]
  }

  private usesCalloutType(): boolean {
    return this.plugin.settings.formatTemplate.includes('{calloutType}')
  }

  hide(): void {
    this.saveSoon.run()
  }

  getControlValue(key: string): unknown {
    return this.plugin.settings[key as keyof BibleSearchSettings]
  }

  setControlValue(key: string, value: unknown): void {
    const settingKey = key as keyof BibleSearchSettings
    const settings: Record<string, unknown> = this.plugin.settings
    const hadCallout = this.usesCalloutType()
    settings[settingKey] = value === '' ? EMPTY_FALLBACKS[settingKey] ?? value : value
    if (this.usesCalloutType() !== hadCallout) this.update()
    if (settingKey === 'cacheEnabled' && value === false) this.plugin.cache.clear()
    this.saveSoon()
  }
}
