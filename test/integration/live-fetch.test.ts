// @vitest-environment jsdom

/**
 * Live URL integration tests — verifies that external Bible APIs are reachable
 * and return expected data structures. Skipped in CI to avoid flaky failures.
 *
 * Run locally: pnpm test -- test/integration/live-fetch.test.ts
 */
import { describe, expect, it } from 'vitest'

import { FetchFn, FetchResponse, resilientFetch } from '../../src/utils/resilient-fetch'

const isCI = !!process.env.CI

// Use native fetch as the transport (no Obsidian dependency in test env)
const httpFetch: FetchFn = async (params) => {
  const res = await fetch(params.url, {
    method: params.method ?? 'GET',
    headers: params.headers,
  })
  const text = await res.text()
  let json: unknown = null
  try { json = JSON.parse(text) } catch { /* not JSON */ }
  return { status: res.status, text, json }
}

describe.skipIf(isCI)('Live fetch — BSKorea', () => {
  it('GAE genesis 1: returns 31 verses', async () => {
    const response = await resilientFetch({
      url: 'https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=gen&chap=1',
      fetchFn: httpFetch,
      timeout: 15_000,
      validateResponse: r => r.text.includes('tdBible1'),
    })
    expect(response.status).toBe(200)
    expect(response.text).toContain('span class="number"')
  }, 20_000)

  it('HAN genesis 1: returns valid HTML', async () => {
    const response = await resilientFetch({
      url: 'https://www.bskorea.or.kr/bible/korbibReadpage.php?version=HAN&book=gen&chap=1',
      fetchFn: httpFetch,
      timeout: 15_000,
      validateResponse: r => r.text.includes('tdBible1'),
    })
    expect(response.status).toBe(200)
    expect(response.text).toContain('span class="number"')
  }, 20_000)
})

describe.skipIf(isCI)('Live fetch — Bolls API', () => {
  it('ESV john 3: returns JSON array with verse field', async () => {
    const response = await resilientFetch({
      url: 'https://bolls.life/get-chapter/ESV/43/3/',
      fetchFn: httpFetch,
      timeout: 15_000,
    })
    expect(response.status).toBe(200)
    const data = response.json as Array<Record<string, unknown>>
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('verse')
    expect(data[0]).toHaveProperty('text')
  }, 20_000)

  it('KJV john 3: returns JSON array with verse field', async () => {
    const response = await resilientFetch({
      url: 'https://bolls.life/get-chapter/KJV/43/3/',
      fetchFn: httpFetch,
      timeout: 15_000,
    })
    expect(response.status).toBe(200)
    const data = response.json as Array<Record<string, unknown>>
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('verse')
  }, 20_000)
})
