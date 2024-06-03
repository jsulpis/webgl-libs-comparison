import { onCanvasResize } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";
import { useWebGLCanvas } from "../useWebGLCanvas";

const canvas = document.querySelector("canvas");

const { setSize } = useWebGLCanvas({ canvas, vertex, fragment });

onCanvasResize(canvas, ({ devicePixelSize }) => {
  setSize(devicePixelSize);
});
