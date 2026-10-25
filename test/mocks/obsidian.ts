export class Plugin {
  app: App
  manifest: any
  loadData() { return Promise.resolve({}) }
  saveData(_data: any) { return Promise.resolve() }
  addCommand(_cmd: any) {}
  addSettingTab(_tab: any) {}
  addRibbonIcon(_icon: string, _title: string, _cb: any) {
    return { addClass: () => {} }
  }
  registerEvent(_ref: any) {}
  registerInterval(_id: number) { return _id }
}
export class Modal {
  app: App
  constructor(_app: App) { this.app = _app }
  open() {}
  close() {}
  onOpen() {}
  onClose() {}
}
export class FuzzySuggestModal<T> {
  app: App
  inputEl: { value: string }
  constructor(_app: App) {
    this.app = _app
    this.inputEl = { value: '' }
  }
  open() {}
  close() {}
  getItems(): T[] { return [] }
  getItemText(_item: T): string { return '' }
  onChooseItem(_item: T, _evt: MouseEvent | KeyboardEvent): void {}
}
export class SuggestModal<T> {
  app: App
  inputEl: HTMLInputElement
  emptyStateText: string = ''
  constructor(_app: App) {
    this.app = _app
    this.inputEl = {
      value: '',
      setSelectionRange(_start: number, _end: number) {},
      dispatchEvent(_evt: Event) { return true },
    } as unknown as HTMLInputElement
  }
  open() {}
  close() {}
  setPlaceholder(_text: string) {}
  getSuggestions(_query: string): T[] | Promise<T[]> { return [] }
  renderSuggestion(_item: T, _el: HTMLElement): void {}
  selectSuggestion(_item: T, _evt: MouseEvent | KeyboardEvent): void { this.close() }
  onChooseSuggestion(_item: T, _evt: MouseEvent | KeyboardEvent): void {}
}
export class PluginSettingTab {
  app: App
  plugin: any
  containerEl: HTMLElement = createDiv()
  constructor(_app: App, _plugin: any) {}
  display() {}
}
export class Setting {
  constructor(_el: HTMLElement) {}
  setName(_name: string) { return this }
  setDesc(_desc: string) { return this }
  addText(_cb: any) { return this }
  addToggle(_cb: any) { return this }
  addDropdown(_cb: any) { return this }
}
export class Notice {
  message: unknown
  timeout?: number
  hidden = false
  constructor(msg: unknown, timeout?: number) {
    this.message = msg
    this.timeout = timeout
  }
  setMessage(msg: unknown) { this.message = msg }
  hide() { this.hidden = true }
}
export declare class App {
  workspace: any
}
export const Platform = { isDesktop: true, isMobile: false }
export function setIcon(el: HTMLElement, icon: string) {
  el.setAttribute('data-icon', icon)
}

export async function requestUrl(_req: {
  url: string
  method?: string
  headers?: Record<string, string>
  throw?: boolean
}): Promise<{ status: number; text: string; json: any }> {
  return { status: 200, text: '', json: {} }
}

export class MarkdownView {
  editor: any
}
export class Editor {
  replaceSelection(_text: string) {}
  getSelection() { return '' }
}
