import { flatten } from "common";
import { type WebGLRenderer } from "four";

const handlers = {
  main,
  canvasResize,
};

addEventListener("message", function (e) {
  const handler = handlers[e.data.type as keyof typeof handlers];
  handler(e.data.payload);
});

let renderer: WebGLRenderer;

interface MainProps {
  canvas: OffscreenCanvas;
  vertex: string;
  fragment: string;
}

async function main({ canvas, fragment, vertex }: MainProps) {
  // something seems to break the script when using a regular import
  const { WebGLRenderer, Geometry, Material, Mesh } = await import("four");

  // @ts-expect-error WebGLRenderer does not accept OffscreenCanvas
  renderer = new WebGLRenderer({ canvas });

  const geometry = new Geometry({
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

  const material = new Material({
    vertex,
    fragment,
    uniforms: {
      uTime: 0.0,
    },
  });

  const mesh = new Mesh(geometry, material);

  requestAnimationFrame(function animate(time) {
    requestAnimationFrame(animate);

    mesh.material.uniforms.uTime = time / 500;
    renderer.render(mesh);
  });
}

function canvasResize(size: { width: number; height: number }) {
  renderer?.setSize(size.width, size.height);
}
