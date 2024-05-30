export { default as fragment } from "./shaders/blob.frag";
export { default as vertex } from "./shaders/blob.vert";

export { setupBlob } from "./blob";
export { onCanvasResize } from "./onCanvasResize";

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}
