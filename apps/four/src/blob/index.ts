import { WebGLRenderer, Material, Geometry, Mesh } from "four";
import { vertex, fragment, setup, onCanvasResize } from "common/src";

function flatten<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}

const canvas = document.querySelector("canvas")!;

const renderer = new WebGLRenderer({ canvas });

const material = new Material({
  vertex: vertex.replaceAll("aPosition", "position"), // four already provides the position attribute
  fragment,
  uniforms: {
    uTime: 0.0,
    uMouse: [0, 0],
    uResolution: [0, 0],
  },
});

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

const mesh = new Mesh(geometry, material);

requestAnimationFrame(function animate(time) {
  requestAnimationFrame(animate);

  mesh.material.uniforms.uTime = time / 500;
  renderer.render(mesh);
});

const { onMouseUpdate } = setup(canvas);
onMouseUpdate((x, y) => {
  const currentMouse = mesh.material.uniforms.uMouse as [number, number];
  mesh.material.uniforms.uMouse = [
    currentMouse[0] + (x - currentMouse[0]) * 0.05,
    currentMouse[1] + (y - currentMouse[1]) * 0.05,
  ];
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  mesh.material.uniforms.uResolution = [devicePixelSize.width, devicePixelSize.height];
  renderer.setSize(devicePixelSize.width, devicePixelSize.height);
});
