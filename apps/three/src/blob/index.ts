import * as THREE from "three";
import { setupBlob, onCanvasResize } from "common";
import { vertex, fragment } from "common/src/shaders/blob.ts";

const canvas = document.querySelector("canvas")!;

const renderer = new THREE.WebGLRenderer({ canvas });

const scene = new THREE.Scene();
const camera = new THREE.Camera();

const material = new THREE.RawShaderMaterial({
  vertexShader: vertex.replaceAll("aPosition", "position").replace("#version 300 es", ""), // three provides the position attribute
  fragmentShader: fragment.replace("#version 300 es", ""),
  uniforms: {
    uTime: { value: 0.0 },
    uMouse: { value: [0, 0] },
    uResolution: { value: [0, 0] },
  },
  glslVersion: THREE.GLSL3,
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

requestAnimationFrame(function animate() {
  requestAnimationFrame(animate);

  mesh.material.uniforms.uTime.value = performance.now() / 500;
  renderer.render(scene, camera);
});

setupBlob(canvas, (targetMouseCoord) => {
  const currentMouse = mesh.material.uniforms.uMouse.value as [number, number];
  mesh.material.uniforms.uMouse.value = [
    currentMouse[0] + (targetMouseCoord.x - currentMouse[0]) * 0.05,
    currentMouse[1] + (targetMouseCoord.y - currentMouse[1]) * 0.05,
  ];
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  mesh.material.uniforms.uResolution.value = [devicePixelSize.width, devicePixelSize.height];
  renderer.setSize(devicePixelSize.width, devicePixelSize.height, false);
});
