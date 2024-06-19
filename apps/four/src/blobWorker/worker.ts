import { flatten } from "common";
import type { Mesh, WebGLRenderer } from "four";

const handlers = {
  main,
  mouseUpdate,
  canvasResize,
};

addEventListener("message", function (e) {
  const handler = handlers[e.data.type as keyof typeof handlers];
  handler(e.data.payload);
});

let renderer: WebGLRenderer;
let mesh: Mesh;

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
    vertex: vertex.replaceAll("aPosition", "position") /* four provides the position attribute */,
    fragment,
    uniforms: {
      uTime: 0.0,
      uMouse: [0, 0],
      uResolution: [0, 0],
    },
  });

  mesh = new Mesh(geometry, material);

  postMessage("ready");

  requestAnimationFrame(function animate(time) {
    requestAnimationFrame(animate);

    mesh.material.uniforms.uTime = time / 500;
    renderer.render(mesh);
  });
}

function mouseUpdate({ x, y }: { x: number; y: number }) {
  if (!mesh) return;
  const currentMouse = mesh.material.uniforms.uMouse as [number, number];
  mesh.material.uniforms.uMouse = [
    currentMouse[0] + (x - currentMouse[0]) * 0.05,
    currentMouse[1] + (y - currentMouse[1]) * 0.05,
  ];
}

function canvasResize(size: { width: number; height: number }) {
  renderer?.setSize(size.width, size.height);
  if (mesh) mesh.material.uniforms.uResolution = [size.width, size.height];
}
