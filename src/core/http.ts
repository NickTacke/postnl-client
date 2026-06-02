import type { ResolvedConfig } from "../config";
import { PostNLApiError, PostNLTimeoutError, parseError } from "./errors";
import type { Family, HttpMethod, RequestContext } from "./types";

export interface SendArgs {
  family: Family;
  method: HttpMethod;
  path: string; // may contain {param} tokens
  pathParams?: Record<string, string> | undefined;
  query?: Record<string, string | string[] | number | boolean | undefined> | undefined;
  body?: unknown;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class Transport {
  constructor(private readonly cfg: ResolvedConfig) {}

  private buildUrl(args: SendArgs): string {
    let path = args.path;
    for (const [k, v] of Object.entries(args.pathParams ?? {})) {
      path = path.replace(`{${k}}`, encodeURIComponent(v));
    }
    const url = new URL(this.cfg.baseUrl + path);
    for (const [k, v] of Object.entries(args.query ?? {})) {
      if (v === undefined) continue;
      if (Array.isArray(v)) for (const item of v) url.searchParams.append(k, String(item));
      else url.searchParams.append(k, String(v));
    }
    return url.toString();
  }

  async send<T = unknown>(args: SendArgs): Promise<T> {
    const url = this.buildUrl(args);
    const headers: Record<string, string> = { apikey: this.cfg.apiKey, accept: "application/json" };
    if (args.body !== undefined) headers["content-type"] = "application/json";
    const ctx: RequestContext = {
      family: args.family,
      method: args.method,
      url,
      headers,
      body: args.body,
    };
    await this.cfg.hooks.onRequest?.(ctx);

    const canRetry = this.cfg.retry.retryMethods.includes(args.method);
    let attempt = 0;
    while (true) {
      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, this.cfg.timeoutMs);
      try {
        const res = await this.cfg.fetch(url, {
          method: args.method,
          headers,
          body: args.body !== undefined ? JSON.stringify(args.body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);
        const text = await res.text();
        const headerObj = Object.fromEntries(res.headers.entries());
        let body: unknown;
        try {
          body = text ? JSON.parse(text) : undefined;
        } catch {
          // non-json body: route through error parser for non-2xx, else fail loudly
          if (!res.ok) {
            const err = parseError(res.status, text, headerObj);
            await this.cfg.hooks.onError?.(err);
            throw err;
          }
          const err = new PostNLApiError(
            res.status,
            "invalid json response",
            undefined,
            undefined,
            text,
          );
          await this.cfg.hooks.onError?.(err);
          throw err;
        }
        if (res.ok) {
          await this.cfg.hooks.onResponse?.({ request: ctx, status: res.status, body });
          return body as T;
        }
        if (
          canRetry &&
          this.cfg.retry.retryStatuses.includes(res.status) &&
          attempt < this.cfg.retry.maxRetries
        ) {
          attempt++;
          await sleep(this.retryDelay(attempt, res.status, headerObj));
          continue;
        }
        const err = parseError(res.status, body, headerObj);
        await this.cfg.hooks.onError?.(err);
        throw err;
      } catch (e) {
        clearTimeout(timer);
        // a PostNLApiError thrown above is already final; re-throw unchanged
        if (e instanceof PostNLApiError) throw e;
        if (canRetry && this.isRetryable(e) && attempt < this.cfg.retry.maxRetries) {
          attempt++;
          await sleep(this.cfg.retry.backoffFactor * 2 ** (attempt - 1) * 100);
          continue;
        }
        // any abort here is our internal timeout (no caller signal yet)
        const surfaced = timedOut ? new PostNLTimeoutError(this.cfg.timeoutMs) : e;
        await this.cfg.hooks.onError?.(surfaced);
        throw surfaced;
      }
    }
  }

  private retryDelay(attempt: number, status: number, headers: Record<string, string>): number {
    if (status === 429) {
      const ra = Number(headers["retry-after"]);
      if (Number.isFinite(ra)) return ra * 1000;
    }
    return this.cfg.retry.backoffFactor * 2 ** (attempt - 1) * 100;
  }

  // only retry genuine network failures: our timeout abort, or a fetch
  // network-level TypeError. bad-url/bad-init TypeErrors should not retry.
  private isRetryable(e: unknown): boolean {
    if ((e as { name?: string })?.name === "AbortError") return true;
    if (!(e instanceof TypeError)) return false;
    const msg = `${e.message} ${String((e as { cause?: unknown }).cause ?? "")}`.toLowerCase();
    return /fetch|network|connect|econn|enotfound|socket|timeout|terminated/.test(msg);
  }
}
