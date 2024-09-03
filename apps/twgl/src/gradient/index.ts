import * as twgl from "twgl.js";
import { flatten } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

const canvas = document.querySelector("canvas")!;

const gl = canvas.getContext("webgl2") as WebGLRenderingContext;
const program = twgl.createProgramFromSources(gl, [vertex, fragment]);
const programInfo = twgl.createProgramInfoFromProgram(gl, program);

const arrays = {
   aPosition: {
      numComponents: 2,
      data: flatten([
         [0, 0],
         [1, 0],
         [0, 1],
         [0, 1],
         [1, 0],
         [1, 1],
      ]),
   },
};

twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.useProgram(programInfo.program);

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

const uniforms = {
   uTime: 0,
};

requestAnimationFrame(function animate(time) {
   requestAnimationFrame(animate);

   uniforms.uTime = time / 500;
   twgl.setUniforms(programInfo, uniforms);
   twgl.drawBufferInfo(gl, bufferInfo);
});
