import { Renderer, Geometry, Program, Mesh } from "ogl";
import { setupBlob, onCanvasResize, flatten } from "common";
import { vertex, fragment } from "common/src/shaders/blob.ts";

const canvas = document.querySelector("canvas")!;

const renderer = new Renderer({ canvas });

const gl = renderer.gl;

const geometry = new Geometry(gl, {
  aPosition: {
    size: 2,
    data: new Float32Array(
      flatten([
        [0, 0],
        [1, 0],
        [0, 1],
        [0, 1],
        [1, 0],
        [1, 1],
      ])
    ),
  },
});

const program = new Program(gl, {
  vertex,
  fragment,
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: [0, 0] },
    uResolution: { value: [0, 0] },
  },
});

const scene = new Mesh(gl, { geometry, program });

requestAnimationFrame(function animate(time) {
  requestAnimationFrame(animate);

  program.uniforms.uTime.value = time / 500;
  renderer.render({ scene });
});

setupBlob(canvas, (targetMouseCoord) => {
  const currentMouse = program.uniforms.uMouse.value as [number, number];
  program.uniforms.uMouse.value = [
    currentMouse[0] + (targetMouseCoord.x - currentMouse[0]) * 0.05,
    currentMouse[1] + (targetMouseCoord.y - currentMouse[1]) * 0.05,
  ];
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  program.uniforms.uResolution.value = [devicePixelSize.width, devicePixelSize.height];
  renderer.setSize(devicePixelSize.width, devicePixelSize.height);
  canvas.removeAttribute("style"); // Remove inline style set by ogl
});
