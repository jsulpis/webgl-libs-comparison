export { setupBlob } from "./blob";
export { onCanvasResize } from "./onCanvasResize";

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}
