import { vertex, fragment, setup, onCanvasResize } from "common/src";
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

const { onMouseUpdate } = setup(canvas);
onMouseUpdate((x, y) => {
  const currentMouse = uniforms.uMouse;
  uniforms.uMouse = [
    currentMouse[0] + (x - currentMouse[0]) * 0.05,
    currentMouse[1] + (y - currentMouse[1]) * 0.05,
  ];
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  setSize(devicePixelSize);
});
