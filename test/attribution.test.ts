import { describe, expect, it } from 'vitest'

import { appendSourceLine, sourceLine } from '../src/domain/attribution'

describe('attribution', () => {
  it('credits each version once with its rights holder and site', () => {
    expect(sourceLine(['GAE', 'ESV', 'GAE'])).toBe(
      '개역개정 © 대한성서공회 · [bskorea.or.kr](https://www.bskorea.or.kr/) | ESV © Crossway · [bolls.life](https://bolls.life/)',
    )
    expect(sourceLine(['KJV'])).toBe('KJV · [bolls.life](https://bolls.life/)')
    expect(sourceLine(['XYZ'])).toBe('')
  })

  it('keeps the credit inside a blockquote or callout', () => {
    expect(appendSourceLine('> [!bible]\n> text', ['KJV'])).toBe(
      '> [!bible]\n> text\n>\n> KJV · [bolls.life](https://bolls.life/)',
    )
  })

  it('separates the credit with a blank line outside a quote, and skips it with no versions', () => {
    expect(appendSourceLine('text', ['KJV'])).toBe('text\n\nKJV · [bolls.life](https://bolls.life/)')
    expect(appendSourceLine('> text', [])).toBe('> text')
  })
})
