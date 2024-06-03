import { onCanvasResize, setupBlob } from "common";
import { vertex, fragment } from "common/src/shaders/blob.ts";
import { useWebGLCanvas } from "../useWebGLCanvas";

const canvas = document.querySelector("canvas");

const { uniforms, setSize } = useWebGLCanvas({
  canvas,
  vertex,
  fragment,
  uniforms: {
    uMouse: [0, 0],
  },
});

setupBlob(canvas, (targetMouseCoord) => {
  const currentMouseCoord = { x: uniforms.uMouse[0], y: uniforms.uMouse[1] };

  uniforms.uMouse = [
    currentMouseCoord.x + (targetMouseCoord.x - currentMouseCoord.x) * 0.05,
    currentMouseCoord.y + (targetMouseCoord.y - currentMouseCoord.y) * 0.05,
  ];
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  setSize(devicePixelSize);
});
