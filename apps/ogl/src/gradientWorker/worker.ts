import { Geometry, Mesh, Program, Renderer } from "ogl";
import { flatten } from "common";

const handlers = {
  main,
  canvasResize,
};

addEventListener("message", function (e) {
  const handler = handlers[e.data.type as keyof typeof handlers];
  handler(e.data.payload);
});

let renderer: Renderer;

interface MainProps {
  canvas: OffscreenCanvas;
  vertex: string;
  fragment: string;
}

async function main({ canvas, fragment, vertex }: MainProps) {
  // @ts-expect-error Renderer does not accept OffscreenCanvas
  renderer = new Renderer({ canvas });

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
}

function canvasResize(size: { width: number; height: number }) {
  renderer.setSize(size.width, size.height);
}
