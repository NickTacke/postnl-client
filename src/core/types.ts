// shared transport + client types
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type Family = "v4" | "legacy";
export type Environment = "sandbox" | "production";

export interface RetryOptions {
  maxRetries: number;
  backoffFactor: number;
  retryStatuses: number[];
  retryMethods: HttpMethod[];
}

export interface RequestContext {
  family: Family;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ResponseContext {
  request: RequestContext;
  status: number;
  body: unknown;
}

export interface Hooks {
  onRequest?: (req: RequestContext) => void | Promise<void>;
  onResponse?: (res: ResponseContext) => void | Promise<void>;
  onError?: (err: unknown) => void | Promise<void>;
}
