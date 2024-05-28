import { Renderer, Geometry, Program, Mesh } from "ogl";
import { vertexShader, fragmentShader } from "shaders";

function flatten<T>(array: T[][]): T[] {
   return array.reduce((acc, val) => acc.concat(val), []);
}

const renderer = new Renderer({
   width: window.innerWidth,
   height: window.innerHeight,
});
const gl = renderer.gl;
document.body.appendChild(gl.canvas);

const geometry = new Geometry(gl, {
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

const program = new Program(gl, {
   vertex: vertexShader,
   fragment: fragmentShader,
   uniforms: {
      time: { value: 0 },
   },
});

const scene = new Mesh(gl, { geometry, program });

requestAnimationFrame(function animate(t) {
   requestAnimationFrame(animate);

   program.uniforms.time.value = t * 0.001;
   renderer.render({ scene });
});

window.addEventListener("resize", () => {
   renderer.setSize(window.innerWidth, window.innerHeight);
});
