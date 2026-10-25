// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

import {
  FetchFn,
  FetchResponse,
  FetchTimeoutError,
  FetchValidationError,
  HttpClientError,
  resilientFetch,
} from '../src/utils/resilient-fetch'

function mockFetchFn(responses: Array<FetchResponse | Error>): FetchFn {
  let call = 0
  return vi.fn(async (): Promise<FetchResponse> => {
    const r = responses[call++]
    if (!r) throw new Error('No more mock responses')
    if (r instanceof Error) throw r
    return r
  })
}

const OK_RESPONSE: FetchResponse = { status: 200, text: 'ok', json: {} }

describe('resilientFetch', () => {
  it('returns response on success', async () => {
    const fetchFn = mockFetchFn([OK_RESPONSE])
    const result = await resilientFetch({ url: 'https://example.com', fetchFn })
    expect(result).toEqual(OK_RESPONSE)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('throws FetchTimeoutError when fetch exceeds timeout', async () => {
    const slowFetch: FetchFn = vi.fn(
      (): Promise<FetchResponse> => new Promise(resolve => window.setTimeout(() => resolve(OK_RESPONSE), 500)),
    )
    await expect(
      resilientFetch({ url: 'https://slow.com', fetchFn: slowFetch, timeout: 50, maxRetries: 1 }),
    ).rejects.toThrow(FetchTimeoutError)
  })

  it('retries on 5xx and succeeds on third attempt', async () => {
    const fetchFn = mockFetchFn([
      { status: 500, text: 'error', json: {} },
      { status: 503, text: 'error', json: {} },
      OK_RESPONSE,
    ])
    const result = await resilientFetch({
      url: 'https://example.com',
      fetchFn,
      backoffBase: 10,
    })
    expect(result).toEqual(OK_RESPONSE)
    expect(fetchFn).toHaveBeenCalledTimes(3)
  })

  it('throws after maxRetries exhausted', async () => {
    const fetchFn = mockFetchFn([
      { status: 500, text: 'error', json: {} },
      { status: 500, text: 'error', json: {} },
      { status: 500, text: 'error', json: {} },
    ])
    await expect(
      resilientFetch({ url: 'https://fail.com', fetchFn, maxRetries: 3, backoffBase: 10 }),
    ).rejects.toThrow('HTTP 500')
  })

  it('does not retry on 4xx errors', async () => {
    const fetchFn = mockFetchFn([{ status: 403, text: 'forbidden', json: {} }])
    await expect(
      resilientFetch({ url: 'https://forbidden.com', fetchFn, backoffBase: 10 }),
    ).rejects.toThrow(HttpClientError)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('throws FetchValidationError when validateResponse fails', async () => {
    const fetchFn = mockFetchFn([OK_RESPONSE])
    await expect(
      resilientFetch({
        url: 'https://example.com',
        fetchFn,
        validateResponse: () => false,
      }),
    ).rejects.toThrow(FetchValidationError)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('passes custom headers to fetchFn', async () => {
    const fetchFn = mockFetchFn([OK_RESPONSE])
    const headers = { 'User-Agent': 'TestBot', Referer: 'https://test.com' }
    await resilientFetch({ url: 'https://example.com', fetchFn, headers })
    expect(fetchFn).toHaveBeenCalledWith({
      url: 'https://example.com',
      method: 'GET',
      headers,
      throw: false,
    })
  })
})
