import * as THREE from "three";
import { onCanvasResize } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

const canvas = document.querySelector("canvas")!;

const renderer = new THREE.WebGLRenderer({ canvas });

const scene = new THREE.Scene();
const camera = new THREE.Camera();

const material = new THREE.RawShaderMaterial({
  vertexShader: vertex.replaceAll("aPosition", "position"), // three provides the position attribute
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0.0 },
  },
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

requestAnimationFrame(function animate() {
  requestAnimationFrame(animate);

  mesh.material.uniforms.uTime.value = performance.now() / 500;
  renderer.render(scene, camera);
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  renderer.setSize(devicePixelSize.width, devicePixelSize.height, false);
});
