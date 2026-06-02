import type { z } from "zod";
import { ENDPOINTS, type OperationKey } from "./endpoints";
import { PostNLValidationError } from "./errors";
import type { Transport } from "./http";

export interface CallArgs<TReq, TRes> {
  operation: OperationKey;
  pathParams?: Record<string, string>;
  query?: Record<string, string | string[] | number | boolean | undefined>;
  input?: TReq;
  requestSchema?: z.ZodType<unknown, z.ZodTypeDef, TReq>;
  // input is unknown wire json; output is the cleaned TRes (schemas may transform/default)
  responseSchema: z.ZodType<TRes, z.ZodTypeDef, unknown>;
}

export abstract class BaseResource {
  constructor(protected readonly transport: Transport) {}

  protected async call<TReq, TRes>(args: CallArgs<TReq, TRes>): Promise<TRes> {
    const ep = ENDPOINTS[args.operation];
    let body: unknown;
    if (args.requestSchema && args.input !== undefined) {
      const parsed = args.requestSchema.safeParse(args.input);
      if (!parsed.success) throw new PostNLValidationError("invalid request", parsed.error.issues);
      body = parsed.data;
    } else {
      body = args.input;
    }
    const raw = await this.transport.send({
      family: ep.family,
      method: ep.method,
      path: ep.path,
      pathParams: args.pathParams,
      query: args.query,
      body: ep.method === "GET" ? undefined : body,
    });
    const out = args.responseSchema.safeParse(raw);
    if (!out.success) throw new PostNLValidationError("invalid response", out.error.issues);
    return out.data;
  }
}
