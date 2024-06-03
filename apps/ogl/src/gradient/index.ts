import { Renderer, Geometry, Program, Mesh } from "ogl";
import { onCanvasResize, flatten } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

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
  vertex: vertex,
  fragment,
  uniforms: {
    uTime: { value: 0 },
  },
});

const scene = new Mesh(gl, { geometry, program });

requestAnimationFrame(function animate(time) {
  requestAnimationFrame(animate);

  program.uniforms.uTime.value = time / 500;
  renderer.render({ scene });
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  renderer.setSize(devicePixelSize.width, devicePixelSize.height);
  canvas.removeAttribute("style"); // Remove inline style set by ogl
});
