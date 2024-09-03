import { onCanvasResize } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";
import { useBasicWebGLCanvas } from "../useWebGLCanvas";

const canvas = document.querySelector("canvas");

const { setSize } = useBasicWebGLCanvas({ canvas, vertex, fragment });

onCanvasResize(canvas, ({ devicePixelSize }) => {
  setSize(devicePixelSize);
});
