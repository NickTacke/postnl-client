import type { ResolvedConfig } from "../config";
import { parseError } from "./errors";
import type { Family, HttpMethod, RequestContext } from "./types";

export interface SendArgs {
  family: Family;
  method: HttpMethod;
  path: string; // may contain {param} tokens
  pathParams?: Record<string, string>;
  query?: Record<string, string | string[] | number | boolean | undefined>;
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
      const timer = setTimeout(() => controller.abort(), this.cfg.timeoutMs);
      try {
        const res = await this.cfg.fetch(url, {
          method: args.method,
          headers,
          body: args.body !== undefined ? JSON.stringify(args.body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);
        const text = await res.text();
        const body = text ? JSON.parse(text) : undefined;
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
          await sleep(this.cfg.retry.backoffFactor * 2 ** (attempt - 1) * 100);
          continue;
        }
        const headerObj = Object.fromEntries(res.headers.entries());
        const err = parseError(res.status, body, headerObj);
        await this.cfg.hooks.onError?.(err);
        throw err;
      } catch (e) {
        clearTimeout(timer);
        const isNetwork = e instanceof TypeError || (e as { name?: string })?.name === "AbortError";
        if (canRetry && isNetwork && attempt < this.cfg.retry.maxRetries) {
          attempt++;
          await sleep(this.cfg.retry.backoffFactor * 2 ** (attempt - 1) * 100);
          continue;
        }
        await this.cfg.hooks.onError?.(e);
        throw e;
      }
    }
  }
}
