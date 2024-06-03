import * as SHREE from "shree";

import { flatten, onCanvasResize } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

var wrapper = document.getElementById("wrapper")!;

const renderer = new SHREE.Renderer();
const canvas = renderer.domElement;
wrapper.appendChild(canvas);

const scene = new SHREE.Scene();
const camera = new SHREE.Camera();

const material = new SHREE.Material({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTime: { type: "f", value: 0.0 },
  },
});

const geometry = new SHREE.Geometry();
geometry.addAttribute(
  "aPosition",
  3,
  flatten([
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
  ])
);
geometry.index = flatten([
  [0, 1, 2],
  [0, 2, 3],
]);

const mesh = new SHREE.Mesh(geometry, material);
scene.add(mesh);

requestAnimationFrame(function animate() {
  requestAnimationFrame(animate);

  mesh.material.uniforms.uTime.value = performance.now() / 500;
  renderer.render(scene, camera);
});

onCanvasResize(canvas, ({ size }) => {
  renderer.setSize(size.width, size.height);
  canvas.removeAttribute("style"); // Remove inline style set by shree
});
