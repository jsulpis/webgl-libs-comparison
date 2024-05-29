import {
   vertexShader as vertexSource,
   fragmentShader as fragmentSource,
} from "common";
import "common/styles.css";

function flatten<T>(array: T[][]): T[] {
   return array.reduce((acc, val) => acc.concat(val), []);
}

function compileShader(
   gl: WebGL2RenderingContext,
   source: string,
   type: number
) {
   const shader = gl.createShader(type);
   if (!shader) {
      throw "could not create shader";
   }
   gl.shaderSource(shader, source);
   gl.compileShader(shader);

   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw "could not compile shader: " + gl.getShaderInfoLog(shader);
   }
   return shader;
}

function createProgram(
   gl: WebGL2RenderingContext,
   vertexShader: WebGLShader,
   fragmentShader: WebGLShader
) {
   const program = gl.createProgram();
   if (!program) {
      throw "could not create program";
   }
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw "could not link program: " + gl.getProgramInfoLog(program);
   }
   return program;
}

function main() {
   const canvas = document.querySelector("canvas");
   if (!canvas) {
      throw "no canvas found";
   }

   const gl = canvas.getContext("webgl2");
   if (!gl) {
      throw "WebGL2 context unavailable";
   }

   const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
   const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
   const program = createProgram(gl, vertexShader, fragmentShader);

   const positionBuffer = gl.createBuffer();
   const positions = flatten([
      [-1, -1, 0],
      [1, -1, 0],
      [-1, 1, 0],
      [1, 1, 0],
   ]);
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

   gl.useProgram(program);

   const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
   gl.enableVertexAttribArray(positionAttributeLocation);
   gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

   const timeUniformLocation = gl.getUniformLocation(program, "uTime");
   const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "uResolution"
   );

   requestAnimationFrame(function renderLoop() {
      requestAnimationFrame(renderLoop);
      gl.uniform1f(timeUniformLocation, performance.now() / 500);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
   });

   // listen for resize of the canvas itself instead of the whole window
   new ResizeObserver((entries) => {
      const size = entries[0].devicePixelContentBoxSize[0];

      // resize after next paint, otherwise there is a glitch
      setTimeout(() => {
         canvas.width = size.inlineSize;
         canvas.height = size.blockSize;

         gl.viewport(0, 0, size.inlineSize, size.blockSize);
         gl.uniform2f(
            resolutionUniformLocation,
            size.inlineSize,
            size.blockSize
         );
      }, 0);
   }).observe(canvas);
}

try {
   main();
} catch (e) {
   console.error(e);
}
