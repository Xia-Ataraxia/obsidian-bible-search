/** Minimal response interface — no Obsidian imports. */
export interface FetchResponse {
  status: number
  text: string
  json: unknown
}

/** Transport function for HTTP requests. */
export type FetchFn = (params: {
  url: string
  method?: string
  headers?: Record<string, string>
  throw?: boolean
}) => Promise<FetchResponse>

export interface ResilientFetchOptions {
  url: string
  fetchFn: FetchFn
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  timeout?: number
  maxRetries?: number
  backoffBase?: number
  validateResponse?: (response: FetchResponse) => boolean
}

const DEFAULT_TIMEOUT = 10_000
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_BACKOFF_BASE = 1000

export class FetchTimeoutError extends Error {
  constructor(url: string, timeoutMs: number) {
    super(`Fetch timed out after ${timeoutMs}ms: ${url}`)
    this.name = 'FetchTimeoutError'
  }
}

export class FetchValidationError extends Error {
  constructor(url: string) {
    super(`Response validation failed: ${url}`)
    this.name = 'FetchValidationError'
  }
}

export class HttpClientError extends Error {
  readonly status: number
  constructor(status: number, url: string) {
    super(`HTTP ${status}: ${url}`)
    this.name = 'HttpClientError'
    this.status = status
  }
}

function isRetryable(status: number): boolean {
  return status >= 500 || status === 0
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

/**
 * Race-based timeout. The underlying fetchFn call is NOT cancelled on timeout
 * (Obsidian's requestUrl has no AbortController support). Under retry, up to
 * maxRetries abandoned connections may run concurrently. Accepted tradeoff
 * for small Bible chapter payloads (~25KB).
 */
function withTimeout<T>(promise: Promise<T>, ms: number, url: string): Promise<T> {
  let timer: number
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new FetchTimeoutError(url, ms)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer!))
}

export async function resilientFetch(opts: ResilientFetchOptions): Promise<FetchResponse> {
  const {
    url,
    fetchFn,
    method = 'GET',
    headers,
    timeout = DEFAULT_TIMEOUT,
    maxRetries = DEFAULT_MAX_RETRIES,
    backoffBase = DEFAULT_BACKOFF_BASE,
    validateResponse,
  } = opts

  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await delay(backoffBase * Math.pow(2, attempt - 1))
    }

    try {
      const response = await withTimeout(
        fetchFn({ url, method, headers, throw: false }),
        timeout,
        url,
      )

      if (response.status >= 400) {
        if (isRetryable(response.status)) {
          lastError = new Error(`HTTP ${response.status}: ${url}`)
          continue
        }
        throw new HttpClientError(response.status, url)
      }

      if (validateResponse && !validateResponse(response)) {
        throw new FetchValidationError(url)
      }

      return response
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // Non-retryable errors — rethrow immediately
      if (err instanceof FetchValidationError) throw err
      if (err instanceof HttpClientError) throw err
    }
  }

  throw lastError ?? new Error(`Fetch failed after ${maxRetries} attempts: ${url}`)
}
