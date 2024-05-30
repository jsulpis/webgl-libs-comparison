import * as SHREE from "shree";

import { vertex, fragment, flatten } from "common";

const wrapper = document.getElementById("wrapper")!;

const renderer = new SHREE.Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
wrapper.appendChild(renderer.domElement);

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
  "position",
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

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});
