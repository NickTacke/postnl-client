// runtime web globals provided by bun/node18+ but missing from the pinned type packages
declare function atob(data: string): string;
declare function btoa(data: string): string;

interface TextDecoder {
  decode(input?: ArrayBufferView | ArrayBuffer): string;
}
