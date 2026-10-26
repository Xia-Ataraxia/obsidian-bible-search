import { setIcon, setTooltip } from 'obsidian'

interface BuildNoticeFragmentOptions {
	id: string
	prefix: string
	text: string
	immutable: boolean
	busy?: boolean
	button?: { text: string; callback: () => void }
	onMute: (id: string) => void
}

export function buildNoticeFragment(opts: BuildNoticeFragmentOptions): DocumentFragment {
	const fragment = createFragment()
	const wrapper = createDiv({ cls: opts.busy ? 'bible-search-notice bible-search-notice--busy' : 'bible-search-notice' })

	wrapper.createDiv({ cls: 'bible-search-notice-head', text: opts.prefix })
	const row = wrapper.createDiv({ cls: 'bible-search-notice-row' })
	row.createEl('p', { cls: 'bible-search-notice-content', text: opts.text })
	if (!opts.immutable) {
		row.appendChild(createMuteButton(opts.id, opts.onMute))
	}

	if (opts.button?.text && typeof opts.button.callback === 'function') {
		wrapper.createDiv({ cls: 'bible-search-notice-actions' }).appendChild(createActionButton(opts.button.text, opts.button.callback))
	}

	fragment.appendChild(wrapper)
	return fragment
}

function createActionButton(text: string, callback: () => void): HTMLButtonElement {
	const button = createEl('button', { cls: 'bible-search-notice-btn', type: 'button', text })
	button.addEventListener('click', callback)
	return button
}

function createMuteButton(id: string, onMute: (id: string) => void): HTMLButtonElement {
	const button = createEl('button', { cls: 'clickable-icon bible-search-notice-mute', type: 'button' })
	setIcon(button, 'bell-off')
	setTooltip(button, 'Mute this notice')
	button.addEventListener('click', (evt) => {
		evt.stopPropagation()
		onMute(id)
	})
	return button
}
