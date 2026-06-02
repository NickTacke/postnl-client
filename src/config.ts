import type { Environment, Hooks, HttpMethod, RetryOptions } from "./core/types";

export interface PostNLClientOptions {
  apiKey: string;
  environment?: Environment;
  fetch?: typeof fetch;
  timeoutMs?: number;
  retry?: Partial<RetryOptions>;
  hooks?: Hooks;
}

export interface ResolvedConfig {
  apiKey: string;
  environment: Environment;
  baseUrl: string;
  fetch: typeof fetch;
  timeoutMs: number;
  retry: RetryOptions;
  hooks: Hooks;
}

const BASE_URLS: Record<Environment, string> = {
  production: "https://api.postnl.nl",
  sandbox: "https://api-sandbox.postnl.nl",
};

const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 3,
  backoffFactor: 2,
  retryStatuses: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
  retryMethods: ["GET", "PUT"] as HttpMethod[],
};

export function resolveConfig(opts: PostNLClientOptions): ResolvedConfig {
  if (!opts?.apiKey) throw new Error("postnl-client: apiKey is required");
  const environment = opts.environment ?? "production";
  const f = opts.fetch ?? globalThis.fetch;
  if (!f) throw new Error("postnl-client: no fetch available; pass options.fetch");
  return {
    apiKey: opts.apiKey,
    environment,
    baseUrl: BASE_URLS[environment],
    fetch: f,
    timeoutMs: opts.timeoutMs ?? 60_000,
    retry: { ...DEFAULT_RETRY, ...opts.retry },
    hooks: opts.hooks ?? {},
  };
}
