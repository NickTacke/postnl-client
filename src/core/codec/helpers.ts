import { z } from "zod";

// accepts T | T[] | {string:T[]} | undefined -> T[]
export function pnlArray<T extends z.ZodTypeAny>(inner: T) {
  return z.preprocess((v) => {
    if (v == null) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === "object" && v !== null && "string" in v) {
      const wrapped = (v as { string: unknown }).string;
      return Array.isArray(wrapped) ? wrapped : [wrapped];
    }
    return [v];
  }, z.array(inner));
}

// accepts {string:T} | T -> T
export function pnlStringWrapped<T extends z.ZodTypeAny>(inner: T) {
  return z.preprocess((v) => {
    if (v != null && typeof v === "object" && "string" in v) {
      return (v as { string: unknown }).string;
    }
    return v;
  }, inner);
}

// coerce stringified scalars from quirky response clusters
export function pnlNum() {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : v),
    z.number(),
  );
}

export function pnlBool() {
  return z.preprocess((v) => (typeof v === "string" ? v.toLowerCase() === "true" : v), z.boolean());
}
