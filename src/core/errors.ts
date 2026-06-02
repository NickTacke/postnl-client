// typed error hierarchy + shape-driven parser for postnl's many error envelopes
export class PostNLError extends Error {}

export class PostNLValidationError extends PostNLError {
  constructor(
    message: string,
    readonly issues: unknown,
  ) {
    super(message);
    this.name = "PostNLValidationError";
  }
}

export class PostNLTimeoutError extends PostNLError {
  constructor(readonly timeoutMs: number) {
    super(`postnl request timed out after ${timeoutMs}ms`);
    this.name = "PostNLTimeoutError";
  }
}

export class PostNLApiError extends PostNLError {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string | undefined,
    readonly detail: unknown,
    readonly raw: unknown,
  ) {
    super(message);
    this.name = "PostNLApiError";
  }
}

export class PostNLAuthError extends PostNLApiError {
  name = "PostNLAuthError";
}
export class PostNLRateLimitError extends PostNLApiError {
  retryAfter?: number;
  name = "PostNLRateLimitError";
}
export class PostNLMethodNotAllowedError extends PostNLApiError {
  name = "PostNLMethodNotAllowedError";
}
export class PostNLBadRequestError extends PostNLApiError {
  name = "PostNLBadRequestError";
}
export class PostNLServerError extends PostNLApiError {
  name = "PostNLServerError";
}

interface Parsed {
  message: string;
  code?: string | undefined;
  detail: unknown;
}

function extract(body: unknown): Parsed {
  const b = body as Record<string, unknown> | null;
  if (b && typeof b === "object") {
    // fault envelope
    const fault = b.fault as { faultstring?: string; detail?: { errorcode?: string } } | undefined;
    if (fault)
      return {
        message: fault.faultstring ?? "fault",
        code: fault.detail?.errorcode,
        detail: fault,
      };
    // legacy InvalidRequest
    const inv = b.Error as { ErrorCode?: string; ErrorDescription?: string } | undefined;
    if (inv?.ErrorDescription)
      return { message: inv.ErrorDescription, code: inv.ErrorCode, detail: b };
    // error lists: barcode {ErrorMsg,ErrorNumber} | labelling {Error,Code} | postalcode {title,detail}
    const list = (b.errors ?? b.Errors) as unknown;
    if (Array.isArray(list) && list.length) {
      const f = list[0] as Record<string, unknown>;
      const msg = (f.ErrorMsg ??
        f.Error ??
        f.title ??
        f.Description ??
        f.detail ??
        "error") as string;
      const code = (f.ErrorNumber ?? f.Code ?? f.status) as string | undefined;
      return { message: String(msg), code: code != null ? String(code) : undefined, detail: list };
    }
    // v4 rfc9457
    if (typeof b.title === "string")
      return { message: b.title, code: b.type as string | undefined, detail: b };
    // gateway
    if (typeof b.message === "string") return { message: b.message, detail: b };
  }
  return { message: `postnl request failed (${typeof body})`, detail: body };
}

export function parseError(
  status: number,
  body: unknown,
  headers?: Record<string, string>,
): PostNLApiError {
  const { message, code, detail } = extract(body);
  if (status === 401) return new PostNLAuthError(status, message, code, detail, body);
  if (status === 429) {
    const err = new PostNLRateLimitError(status, message, code, detail, body);
    const ra = Number(headers?.["retry-after"]);
    if (Number.isFinite(ra)) err.retryAfter = ra;
    return err;
  }
  if (status === 405) return new PostNLMethodNotAllowedError(status, message, code, detail, body);
  if (status >= 500) return new PostNLServerError(status, message, code, detail, body);
  if (status === 400) return new PostNLBadRequestError(status, message, code, detail, body);
  return new PostNLApiError(status, message, code, detail, body);
}
