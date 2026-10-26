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
	const wrapper = createDiv({ cls: opts.busy ? 'plugin-notice plugin-notice--busy' : 'plugin-notice' })

	const head = wrapper.createDiv({ cls: 'plugin-notice-head' })
	head.createSpan({ text: opts.prefix })
	if (!opts.immutable) {
		head.appendChild(createMuteButton(opts.id, opts.onMute))
	}
	wrapper.appendChild(createEl('p', { cls: 'plugin-notice-content', text: opts.text }))

	if (opts.button?.text && typeof opts.button.callback === 'function') {
		wrapper.createDiv({ cls: 'plugin-notice-actions' }).appendChild(createActionButton(opts.button.text, opts.button.callback))
	}

	fragment.appendChild(wrapper)
	return fragment
}

function createActionButton(text: string, callback: () => void): HTMLButtonElement {
	const button = createEl('button', { cls: 'plugin-notice-btn', type: 'button', text })
	button.addEventListener('click', callback)
	return button
}

function createMuteButton(id: string, onMute: (id: string) => void): HTMLButtonElement {
	const button = createEl('button', { cls: 'clickable-icon plugin-notice-mute', type: 'button' })
	setIcon(button, 'bell-off')
	setTooltip(button, 'Mute this notice')
	button.addEventListener('click', (evt) => {
		evt.stopPropagation()
		onMute(id)
	})
	return button
}
