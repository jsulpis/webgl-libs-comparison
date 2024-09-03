import { flatten } from "common";

type VectorUniform = [number, number] | [number, number, number] | [number, number, number, number];
type UniformValue = number | VectorUniform;
type UniformsObj = Record<string, UniformValue> | {};

interface WebGLCanvasProps<Uniforms extends UniformsObj> {
   canvas: HTMLCanvasElement | OffscreenCanvas;
   fragment: string;
   vertex: string;
   uniforms?: Uniforms;
}

interface AttributeObj {
   size: number;
   data: Float32Array | Uint16Array | Uint8Array;
   type?: GLenum;
   normalize?: boolean;
   stride?: number;
   offset?: number;
}

export function loop(callback: (time: number) => void) {
   let lastTime = 0;

   requestAnimationFrame(function loop(time: number) {
      const deltaTime = time - lastTime;
      lastTime = time;
      callback(deltaTime);
      requestAnimationFrame(loop);
   });
}

interface MeshOptions {
   fragment: string;
   vertex: string;
   attributes: Record<string, AttributeObj>;
   uniforms: UniformsObj;
   drawingMode?: number;
}

interface Mesh {
   program: WebGLProgram;
   vao: WebGLVertexArrayObject;
   count: number;
   uniformsLocations: Map<string, WebGLUniformLocation>;
   drawingMode: number;
}

export function createGeometry(
   gl: WebGL2RenderingContext,
   attributes: Record<string, AttributeObj>
) {
   let count: number;
   const vao = gl.createVertexArray();
   gl.bindVertexArray(vao);
   for (const [attributeName, attr] of Object.entries(attributes)) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, attr.data, gl.STATIC_DRAW);
      const attrCount = attr.stride
         ? attr.data.byteLength / attr.stride
         : attr.data.length / attr.size;
      count = Math.max(count, attrCount);
   }
   gl.bindVertexArray(null);
   gl.bindBuffer(gl.ARRAY_BUFFER, null);
   return { vao, count };
}

// export function createMesh<Uniforms extends UniformsObj>(
//    gl: WebGL2RenderingContext,
//    { fragment, vertex, attributes, uniforms, drawingMode = gl.TRIANGLES }: MeshOptions
// ): Mesh {
//    type UniformName = Extract<keyof Uniforms, string>;

//    const program = createProgram(gl, { vertex, fragment });
//    let count: number;

//    const vao = gl.createVertexArray();
//    gl.bindVertexArray(vao);

//    for (const [attributeName, attr] of Object.entries(attributes)) {
//       const buffer = gl.createBuffer();
//       gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//       gl.bufferData(gl.ARRAY_BUFFER, attr.data, gl.STATIC_DRAW);

//       setAttribute(gl, program, attributeName, attr);

//       const attrCount = attr.stride
//          ? attr.data.byteLength / attr.stride
//          : attr.data.length / attr.size;

//       count = Math.max(count, attrCount);
//    }

//    gl.bindVertexArray(null);
//    gl.bindBuffer(gl.ARRAY_BUFFER, null);

//    const uniformsLocations =
//       uniforms != undefined
//          ? new Map(
//               Object.keys(uniforms).map((uniformName) => [
//                  uniformName,
//                  gl.getUniformLocation(program, uniformName),
//               ])
//            )
//          : new Map();

//    const uniformsProxy =
//       uniforms != undefined
//          ? new Proxy(uniforms, {
//               set(target, prop: UniformName, value) {
//                  const result = setUniform(prop, value);
//                  Object.assign(target, { [prop]: value });
//                  return result !== -1;
//               },
//            })
//          : uniforms;

//    function setUniform<U extends UniformName>(uniform: U, value: Uniforms[U]): void | -1 {
//       const uniformLocation = uniformsLocations.get(uniform);
//       if (uniformLocation === -1) return -1;

//       if (typeof value === "number") return gl.uniform1f(uniformLocation, value);

//       if (Array.isArray(value)) {
//          switch (value.length) {
//             case 2:
//                return gl.uniform2fv(uniformLocation, value);
//             case 3:
//                return gl.uniform3fv(uniformLocation, value);
//             case 4:
//                return gl.uniform4fv(uniformLocation, value);
//          }
//       }
//    }

//    return { program, vao, uniforms: uniformsProxy, setUniform, drawingMode, count };
// }

// export const useBasicWebGLCanvas = <Uniforms extends UniformsObj>({
//    canvas,
//    fragment,
//    vertex,
//    uniforms,
// }: WebGLCanvasProps<Uniforms>) => {
//    let gl = canvas.getContext("webgl2");
//    if (!gl) throw "WebGL2 context unavailable";

//    const mesh = createMesh(gl, {
//       fragment,
//       vertex,
//       attributes: {
//          aPosition: {
//             size: 3,
//             data: new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]),
//          },
//       },
//       uniforms,
//    });

//    function render() {
//       gl.clearColor(0, 0, 0, 0);
//       gl.clear(gl.COLOR_BUFFER_BIT);

//       gl.useProgram(mesh.program);
//       gl.bindVertexArray(mesh.vao);
//       gl.drawArrays(mesh.drawingMode, 0, mesh.count);
//    }

//    function setSize({ width, height }: { width: number; height: number }) {
//       canvas.width = width;
//       canvas.height = height;

//       gl.viewport(0, 0, width, height);
//    }

//    return { canvas, setSize, setUniform: mesh.setUniform, uniforms: mesh.setUniform, gl, render };
// };

function setAttribute(
   gl: WebGL2RenderingContext,
   program: WebGLProgram,
   name: string,
   attr: AttributeObj
) {
   const location = gl.getAttribLocation(program, name);
   gl.enableVertexAttribArray(location);

   const type =
      attr.type ||
      (attr.data.constructor === Float32Array
         ? gl.FLOAT
         : attr.data.constructor === Uint16Array
         ? gl.UNSIGNED_SHORT
         : gl.UNSIGNED_INT); // Uint32Array

   gl.vertexAttribPointer(
      location,
      attr.size,
      type,
      attr.normalize || false,
      attr.stride || 0,
      attr.offset || 0
   );
}

export function compileShader(gl: WebGL2RenderingContext, source: string, type: number) {
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

export function bindAttribute(
   gl: WebGL2RenderingContext,
   program: WebGLProgram,
   name: string,
   attr: AttributeObj
) {
   const location = gl.getAttribLocation(program, name);
   gl.enableVertexAttribArray(location);
   const type =
      attr.type ||
      (attr.data.constructor === Float32Array
         ? gl.FLOAT
         : attr.data.constructor === Uint16Array
         ? gl.UNSIGNED_SHORT
         : gl.UNSIGNED_INT); // Uint32Array
   gl.vertexAttribPointer(
      location,
      attr.size,
      type,
      attr.normalize || false,
      attr.stride || 0,
      attr.offset || 0
   );
   return location;
}

export function createProgram(
   gl: WebGL2RenderingContext,
   { vertex, fragment }: { vertex: string; fragment: string }
) {
   const program = gl.createProgram();
   if (!program) {
      throw "could not create program";
   }

   const vertexShader = compileShader(gl, vertex, gl.VERTEX_SHADER);
   const fragmentShader = compileShader(gl, fragment, gl.FRAGMENT_SHADER);

   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw "could not link program: " + gl.getProgramInfoLog(program);
   }
   return program;
}

interface RenderTarget {
   framebuffer: WebGLFramebuffer;
   texture: WebGLTexture;
   width: number;
   height: number;
}

export function createRenderTarget(
   gl: WebGL2RenderingContext,
   size?: { width: number; height: number }
): RenderTarget {
   const { width = gl.canvas.width, height = gl.canvas.height } = size || {};
   const framebuffer = gl.createFramebuffer();
   const texture = createTexture(gl, { data: null, width, height });

   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

   return { framebuffer, texture, width, height };
}

export function setRenderTarget(gl: WebGL2RenderingContext, target: RenderTarget | null) {
   const framebuffer = target?.framebuffer || null;
   const { width, height } = target || gl.canvas;

   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.viewport(0, 0, width, height);
}

function createTexture(
   gl: WebGL2RenderingContext,
   { data = null, width, height }: { data: ArrayBufferView; width: number; height: number }
) {
   const texture = gl.createTexture();

   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

   return texture;
}

export function createBuffer(
   gl: WebGLRenderingContext,
   data: AllowSharedBufferSource
): WebGLBuffer {
   const buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

   return buffer;
}

const quadVertexShaderSource = /*glsl*/ `#version 300 es
in vec2 a_position;
out vec2 v_texCoord;
void main() {
   gl_Position = vec4(a_position, 0.0, 1.0);
   v_texCoord = (a_position + 1.0) / 2.0;
}
`;

export function createRenderPass<Uniforms extends UniformsObj>(
   gl: WebGL2RenderingContext,
   {
      fragment,
      vertex,
      attributes,
      uniforms,
      width,
      height,
      target,
   }: {
      fragment: string;
      target?: RenderTarget;
      vertex?: string;
      attributes?: Record<string, AttributeObj>;
      width?: number;
      height?: number;
      uniforms?: Uniforms;
   }
) {
   const renderTarget = target !== undefined ? target : createRenderTarget(gl, { width, height });

   const program = createProgram(gl, { vertex: vertex || quadVertexShaderSource, fragment });

   const vao = gl.createVertexArray();
   gl.bindVertexArray(vao);

   let vertexCount = 0;

   if (attributes) {
      for (const [name, attribute] of Object.entries(attributes)) {
         const { data, size, type = gl.FLOAT, normalize = false } = attribute;
         const location = gl.getAttribLocation(program, name);
         const buffer = createBuffer(gl, data);

         gl.enableVertexAttribArray(location);
         gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
         gl.vertexAttribPointer(location, size, type, normalize, 0, 0);

         const attrCount = attribute.stride
            ? attribute.data.byteLength / attribute.stride
            : attribute.data.length / attribute.size;
         vertexCount = Math.max(vertexCount, attrCount);
      }
   } else {
      // create 2 triangles for the post process quad
      const positionBuffer = createBuffer(
         gl,
         new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
      );
      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      vertexCount = 6;
   }

   type UniformName = Extract<keyof Uniforms, string>;

   gl.useProgram(program);

   const uniformsLocations = new Map(
      Object.keys(uniforms || {}).map((uniformName) => [
         uniformName,
         gl.getUniformLocation(program, uniformName),
      ])
   );

   let textureUnitIndex = 0;
   const textureUnits = new Map<UniformName, number>();

   const liveUniforms: Uniforms = { ...uniforms };

   function setUniforms() {
      Object.entries(liveUniforms).forEach(([uniformName, uniformValue]) => {
         setUniform(uniformName as UniformName, uniformValue as Uniforms[UniformName]);
      });
   }
   function updateUniform<U extends UniformName>(name: U, value: Uniforms[U]) {
      liveUniforms[name] = value;
   }

   function setUniform<U extends UniformName>(name: U, value: Uniforms[U]) {
      const uniformLocation = uniformsLocations.get(name);
      if (uniformLocation === -1) return -1;

      if (typeof value === "number") return gl.uniform1f(uniformLocation, value);

      if (value instanceof WebGLTexture) {
         if (!textureUnits.has(name)) {
            textureUnits.set(name, textureUnitIndex++);
         }
         gl.activeTexture(gl.TEXTURE0 + textureUnits.get(name));
         gl.bindTexture(gl.TEXTURE_2D, value);

         return gl.uniform1i(uniformLocation, textureUnits.get(name));
      }

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
   function render(options?: { mode: GLenum }) {
      setRenderTarget(gl, renderTarget);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      setUniforms();
      gl.drawArrays(options?.mode ?? gl.TRIANGLES, 0, vertexCount);
      gl.bindVertexArray(null);
   }

   return { render, target: renderTarget, updateUniform };
}
