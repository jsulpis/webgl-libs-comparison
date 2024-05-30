import { vertex, fragment, setup } from "common/src";
import "common/src/styles.css";
import { useWebGLCanvas } from "./useWebGLCanvas";

const canvas = document.querySelector("canvas");

const { uniforms } = useWebGLCanvas({
  canvas,
  vertex,
  fragment,
  uniforms: {
    uMouse: [0, 0],
    uTest: 2,
  },
});

const { onMouseUpdate } = setup(canvas);
const speed = 0.05;

onMouseUpdate((x, y) => {
  const currentMouse = uniforms.uMouse;

  uniforms.uMouse = [
    currentMouse[0] + (x - currentMouse[0]) * speed,
    currentMouse[1] + (y - currentMouse[1]) * speed,
  ];
});
