import * as THREE from "three";

import { fragmentShader, vertexShader } from "shaders";

const wrapper = document.getElementById("wrapper")!;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
wrapper.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.Camera();

const material = new THREE.ShaderMaterial({
   vertexShader: vertexShader.replace("attribute vec3 position;", ""), // three already provides the position attribute
   fragmentShader,
   uniforms: {
      time: { value: 0.0 },
   },
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

requestAnimationFrame(function animate() {
   requestAnimationFrame(animate);

   mesh.material.uniforms.time.value = performance.now() / 500;
   renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
   renderer.setSize(window.innerWidth, window.innerHeight);
});
