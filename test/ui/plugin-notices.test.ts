// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

import { Notice } from 'obsidian'
import { PluginNotices } from '../../src/ui/plugin-notices'
import type { NoticeCatalog, PluginNoticesHost } from '../../src/ui/plugin-notice-types'

// jsdom lacks Obsidian's global DOM helpers.
function createEl(tag: string, o: { cls?: string; text?: string; type?: string } = {}): HTMLElement {
	const el = document.createElement(tag)
	if (o.cls) el.className = o.cls
	if (o.text) el.textContent = o.text
	if (o.type) el.setAttribute('type', o.type)
	return el
}
vi.stubGlobal('createEl', createEl)
vi.stubGlobal('createDiv', (o?: { cls?: string }) => createEl('div', o))
vi.stubGlobal('createFragment', () => document.createDocumentFragment())

describe('PluginNotices', () => {
	it('interpolates messages and reuses an active notice by id', () => {
		const plugin = createHost()
		const notices = new PluginNotices(plugin, catalog(), 'Bible')

		const first = notices.show('fetch_failed', { name: 'John' })
		const second = notices.show('fetch_failed', { name: 'Mark' })

		expect(first).toBeInstanceOf(Notice)
		expect(second).toBe(first)
		expect(readText(first)).toContain('Failed Mark')
	})

	it('persists mute state and suppresses muted notices', async () => {
		const plugin = createHost()
		const notices = new PluginNotices(plugin, catalog(), 'Bible')

		await notices.mute('fetch_failed')

		expect(plugin.saveSettings).toHaveBeenCalledTimes(1)
		expect(notices.isMuted('fetch_failed')).toBe(true)
		expect(notices.show('fetch_failed', { name: 'John' })).toBeNull()
	})
})

function catalog(): NoticeCatalog {
	return {
		fetch_failed: {
			template: 'Failed {{name}}',
			timeout: 100,
		},
	}
}

function createHost(): PluginNoticesHost & { saveSettings: ReturnType<typeof vi.fn> } {
	return {
		settings: {},
		saveSettings: vi.fn().mockResolvedValue(undefined),
	}
}

function readText(notice: Notice | null): string {
	const raw = (notice as unknown as { message?: unknown })?.message
	if (raw instanceof DocumentFragment) return raw.textContent ?? ''
	if (raw instanceof HTMLElement) return raw.textContent ?? ''
	if (typeof raw === 'string') return raw
	if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw)
	return ''
}
