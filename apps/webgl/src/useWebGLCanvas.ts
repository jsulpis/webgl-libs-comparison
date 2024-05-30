import type { UniformValue, WebGLCanvasFn, WebGLCanvasProps } from "common";

export const useWebGLCanvas: WebGLCanvasFn = <Uniforms extends Record<string, UniformValue>>({
  canvas,
  fragment,
  vertex,
  uniforms,
}: WebGLCanvasProps<Uniforms>) => {
  type UniformName = Extract<keyof Uniforms, string>;

  let gl: WebGL2RenderingContext;
  let program: WebGLProgram;

  try {
    gl = canvas.getContext("webgl2");
    if (!gl) throw "WebGL2 context unavailable";

    program = setupProgram(gl, fragment, vertex);
  } catch (e) {
    console.error(e);
    return { canvas, setUniform: () => {}, uniforms };
  }

  const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  const timeUniformLocation = gl.getUniformLocation(program, "uTime");
  const resolutionUniformLocation = gl.getUniformLocation(program, "uResolution");

  requestAnimationFrame(function renderLoop() {
    requestAnimationFrame(renderLoop);
    gl.uniform1f(timeUniformLocation, performance.now() / 500);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });

  const uniformsLocations = new Map(
    Object.keys(uniforms).map((uniformName) => [
      uniformName,
      gl.getUniformLocation(program, uniformName),
    ])
  );

  const uniformsProxy = new Proxy(uniforms, {
    set(target, prop: UniformName, value) {
      const result = setUniform(prop, value);
      Object.assign(target, { [prop]: value });
      return result !== -1;
    },
  });

  function setUniform<U extends UniformName>(uniform: U, value: Uniforms[U]): void | -1 {
    const uniformLocation = uniformsLocations.get(uniform);
    if (uniformLocation === -1) return -1;

    if (typeof value === "number") return gl.uniform1f(uniformLocation, value);

    if (Array.isArray(value)) {
      switch (value.length) {
        case 2:
          return gl.uniform2fv(uniformLocation, value);
        case 3:
          return gl.uniform3fv(uniformLocation, value);
        case 4:
          return gl.uniform4fv(uniformLocation, value);
      }
    }
  }

  // listen for resize of the canvas itself instead of the whole window
  new ResizeObserver((entries) => {
    const size = entries[0].devicePixelContentBoxSize[0];

    // resize after next paint, otherwise there is a glitch
    setTimeout(() => {
      canvas.width = size.inlineSize;
      canvas.height = size.blockSize;

      gl.viewport(0, 0, size.inlineSize, size.blockSize);
      gl.uniform2f(resolutionUniformLocation, size.inlineSize, size.blockSize);
    }, 0);
  }).observe(canvas);

  return { canvas, setUniform, uniforms: uniformsProxy };
};

function setupProgram(gl: WebGL2RenderingContext, fragment: string, vertex: string) {
  const vertexShader = compileShader(gl, vertex, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragment, gl.FRAGMENT_SHADER);
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

  return program;
}

function flatten<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}

function compileShader(gl: WebGL2RenderingContext, source: string, type: number) {
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
