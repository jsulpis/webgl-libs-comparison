import { Renderer, Geometry, Program, Mesh } from "ogl";
import { vertex, fragment, setupBlob, onCanvasResize, flatten } from "common";

const canvas = document.querySelector("canvas")!;

const renderer = new Renderer({ canvas });
removeInlineStyles(canvas);

const gl = renderer.gl;

const geometry = new Geometry(gl, {
  position: {
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
  vertex: vertex.replaceAll("aPosition", "position"), // ogl already provides the position attribute
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
  removeInlineStyles(canvas);
});

/**
 * Remove inline style set by ogl
 */
function removeInlineStyles(canvas: HTMLCanvasElement) {
  canvas.style.width = "";
  canvas.style.height = "";
}
