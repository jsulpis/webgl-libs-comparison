import { onCanvasResize } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

const canvas = document.querySelector("canvas")!;
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

worker.postMessage(
  {
    type: "main",
    payload: {
      canvas: offscreen,
      fragment,
      vertex,
    },
  },
  [offscreen]
);

onCanvasResize(canvas, ({ devicePixelSize }) => {
  worker.postMessage({ type: "canvasResize", payload: devicePixelSize });
});
