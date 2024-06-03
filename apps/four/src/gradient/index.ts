import { WebGLRenderer, Material, Geometry, Mesh } from "four";
import { onCanvasResize, flatten } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

const canvas = document.querySelector("canvas")!;

const renderer = new WebGLRenderer({ canvas });

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
  vertex: vertex.replaceAll("aPosition", "position"), // four provides the position attribute
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

onCanvasResize(canvas, ({ devicePixelSize }) => {
  renderer.setSize(devicePixelSize.width, devicePixelSize.height);
});
