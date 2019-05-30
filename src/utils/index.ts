// base64 -> バッファ変換する関数
export function base64ToBuffer(base64: string): ArrayBuffer {
  const bin: string = atob(base64.replace(/^.*,/, ""));
  const buffer: Uint8Array = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  return buffer.buffer;
}
