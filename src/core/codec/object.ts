// drops undefined keys so output types model them as optional (matches stripped runtime shape)
export const stripUndefined = <T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as { [K in keyof T]?: Exclude<T[K], undefined> };
};
