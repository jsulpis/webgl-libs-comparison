import * as THREE from "three";

const handlers = {
  main,
  mouseUpdate,
  canvasResize,
};

addEventListener("message", function (e) {
  const handler = handlers[e.data.type as keyof typeof handlers];
  handler(e.data.payload);
});

let renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial, THREE.Object3DEventMap>;

interface MainProps {
  canvas: OffscreenCanvas;
  vertex: string;
  fragment: string;
}

async function main({ canvas, fragment, vertex }: MainProps) {
  renderer = new THREE.WebGLRenderer({ canvas });

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
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  requestAnimationFrame(function animate() {
    requestAnimationFrame(animate);

    mesh.material.uniforms.uTime.value = performance.now() / 500;
    renderer.render(scene, camera);
  });
}

function mouseUpdate({ x, y }: { x: number; y: number }) {
  if (!mesh) return;
  const currentMouse = mesh.material.uniforms.uMouse.value as [number, number];
  mesh.material.uniforms.uMouse.value = [
    currentMouse[0] + (x - currentMouse[0]) * 0.05,
    currentMouse[1] + (y - currentMouse[1]) * 0.05,
  ];
}

function canvasResize(size: { width: number; height: number }) {
  renderer?.setSize(size.width, size.height, false);
  if (mesh) mesh.material.uniforms.uResolution.value = [size.width, size.height];
}
