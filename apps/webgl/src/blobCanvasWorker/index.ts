import { onCanvasResize, setup, vertex, fragment } from "common/src";

const canvas = document.querySelector("canvas");
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
worker.postMessage({ type: "main", payload: { canvas: offscreen, fragment, vertex } }, [offscreen]);

const { onMouseUpdate } = setup(canvas);
onMouseUpdate((x, y) => {
  worker.postMessage({ type: "mouseUpdate", payload: { x, y } });
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  worker.postMessage({ type: "canvasResize", payload: devicePixelSize });
});
