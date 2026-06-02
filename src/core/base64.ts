// label/signature content is base64. runtime-agnostic decode (atob exists in node18+, bun, deno, workers)
export function decodeBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  zpl: "text/plain",
};

export function labelContentType(outputType: string): string {
  return CONTENT_TYPES[outputType.toLowerCase()] ?? "application/octet-stream";
}

export interface DecodedLabel {
  base64: string;
  contentType: string;
  bytes(): Uint8Array;
}

export function toDecodedLabel(base64: string, outputType: string): DecodedLabel {
  return { base64, contentType: labelContentType(outputType), bytes: () => decodeBase64(base64) };
}
