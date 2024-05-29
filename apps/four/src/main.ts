import {
   WebGLRenderer,
   PerspectiveCamera,
   Material,
   Geometry,
   Mesh,
} from "four";
import { vertexShader, fragmentShader } from "common";

function flatten<T>(array: T[][]): T[] {
   return array.reduce((acc, val) => acc.concat(val), []);
}

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.canvas);

const camera = new PerspectiveCamera();

const material = new Material({
   vertex: vertexShader,
   fragment: fragmentShader,
   uniforms: {
      uTime: 0.0,
   },
});

const geometry = new Geometry({
   position: {
      size: 3,
      data: new Float32Array(
         flatten([
            [0, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
            [0, 1, 0],
            [1, 0, 0],
            [1, 1, 0],
         ])
      ),
   },
});

const mesh = new Mesh(geometry, material);

requestAnimationFrame(function animate() {
   requestAnimationFrame(animate);

   mesh.material.uniforms.uTime = performance.now() / 500;
   renderer.render(mesh, camera);
});

window.addEventListener("resize", () => {
   renderer.setSize(window.innerWidth, window.innerHeight);
});
