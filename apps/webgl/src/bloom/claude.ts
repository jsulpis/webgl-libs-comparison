import { compileShader, createRenderTarget, createProgram } from "../useWebGLCanvas";

// Shader sources
const vertexShaderSource = /*glsl*/ `#version 300 es
   in vec2 a_position;
   out vec2 v_texCoord;

   void main() {
      v_texCoord = (a_position + 1.0) / 2.0;
      gl_Position = vec4(a_position, 0.0, 1.0);
      gl_PointSize = 20.0;
   }
`;

const fragmentShaderSource = /*glsl*/ `#version 300 es
   precision mediump float;
   out vec4 outColor;
   in vec2 v_texCoord;
   
   void main() {
      outColor = vec4(v_texCoord.x, v_texCoord.y, 1.0, 1.0);
      // outColor = vec4(1.);
   }
`;

const quadVertexShaderSource = /*glsl*/ `#version 300 es
in vec2 a_position;
out vec2 v_texCoord;
void main() {
   gl_Position = vec4(a_position, 0.0, 1.0);
   v_texCoord = (a_position + 1.0) / 2.0;
}
`;

const thresholdFragmentShaderSource = /*glsl*/ `#version 300 es
   precision mediump float;
   uniform sampler2D u_image;
   in vec2 v_texCoord;
   in vec2 vUv;
   out vec4 outColor;
    
    void main() {
    vec4 color = texture(u_image, v_texCoord);
        float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        if(brightness > 0.) {
        outColor = color;
        } else {
         outColor = vec4(0.0, 0.0, 0.0, 1.0);
   }
    }
`;

const blurFragmentShaderSource = /*glsl*/ `#version 300 es
   precision mediump float;
   uniform sampler2D u_image;
   uniform vec2 u_resolution;
   uniform vec2 u_direction;
   uniform float uScale;
   uniform float uLod;
   in vec2 v_texCoord;
   out vec4 outColor;

   void main() {
      vec2 pixelSize = 1.0 / vec2(u_resolution.x, u_resolution.y);
      float lodFactor = exp2(uLod);
      
      vec3 bloom = vec3(0.0);
      //vec2 scale = lodFactor * pixelSize;
      
      //vec2 coord = (v_texCoord - pixelSize) * lodFactor;
      float totalWeight = 0.0;

      // for (float i = -5.; i < 5.; i++) {
      //    float wg = pow(1.0-length(i * u_direction) * 0.125,6.0);

      //    bloom += pow(texture(u_image, lodFactor * (v_texCoord  + i * u_direction * pixelSize), uLod).rgb, vec3(2.2)) * wg;
      //    totalWeight += wg;
      // }


      for (int i = -5; i <= 5; i++) {
        for (int j = -5; j <= 5; j++) {

            float wg = pow(1.0 - length(vec2(i,j)) * 0.125, 6.0);

            bloom += pow(texture(u_image, exp2(uLod) * (v_texCoord) + vec2(i,j) * pixelSize).rgb, vec3(2.2)) * wg;
            totalWeight += wg;

        }
    }

      outColor = vec4(pow(bloom / totalWeight, vec3(1./2.2)), 1.0);
   }
`;

const combineFragmentShaderSource = /* glsl */ `#version 300 es
   precision mediump float;
   uniform sampler2D u_image;
   uniform sampler2D u_bloomTexture1;
   uniform sampler2D u_bloomTexture2;
   in vec2 v_texCoord;
   out vec4 outColor;
    
   void main() {
      vec4 baseColor = texture(u_image, v_texCoord);
      vec4 bloomColor = pow(texture(u_bloomTexture1, v_texCoord), vec4(2.2)) * 1.
                        + pow(texture(u_bloomTexture2, v_texCoord), vec4(2.2)) * 2.;
      //  outColor = baseColor;

      outColor = baseColor + bloomColor;
      //  outColor = bloomColor;
      // outColor = baseColor + texture(u_bloomTexture1, v_texCoord);
   }
`;

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  alert("Unable to initialize WebGL. Your browser may not support it.");
}
// Create programs
const mainProgram = createProgram(
  gl,
  compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER),
  compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)
);
const thresholdProgram = createProgram(
  gl,
  compileShader(gl, quadVertexShaderSource, gl.VERTEX_SHADER),
  compileShader(gl, thresholdFragmentShaderSource, gl.FRAGMENT_SHADER)
);
const blurProgram = createProgram(
  gl,
  compileShader(gl, quadVertexShaderSource, gl.VERTEX_SHADER),
  compileShader(gl, blurFragmentShaderSource, gl.FRAGMENT_SHADER)
);
const combineProgram = createProgram(
  gl,
  compileShader(gl, quadVertexShaderSource, gl.VERTEX_SHADER),
  compileShader(gl, combineFragmentShaderSource, gl.FRAGMENT_SHADER)
);

// Create buffers and textures
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [];
const particleCount = 100;

const squareSize = Math.sqrt(particleCount) / 2;
for (let i = 0; i < squareSize; i++) {
  for (let j = 0; j < squareSize; j++) {
    positions.push(i / squareSize);
    positions.push(j / squareSize);
    positions.push(-i / squareSize);
    positions.push(-j / squareSize);
    positions.push(i / squareSize);
    positions.push(-j / squareSize);
    positions.push(-i / squareSize);
    positions.push(j / squareSize);
  }
}

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Create a buffer for the full-screen quad
const quadBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
  gl.STATIC_DRAW
);

let framebuffers: Array<{ framebuffer: WebGLFramebuffer; texture: WebGLTexture }> = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  framebuffers = [
    createRenderTarget(gl, canvas.width, canvas.height),
    createRenderTarget(gl, canvas.width, canvas.height),
  ];
}

function render() {
  // Render particles to first framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0].framebuffer);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(mainProgram);
  const positionAttributeLocation = gl.getAttribLocation(mainProgram, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.POINTS, 0, particleCount);

  // Threshold
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1].framebuffer);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(thresholdProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  const thresholdPositionAttribute = gl.getAttribLocation(thresholdProgram, "a_position");
  gl.enableVertexAttribArray(thresholdPositionAttribute);
  gl.vertexAttribPointer(thresholdPositionAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, framebuffers[0].texture);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.useProgram(blurProgram);
  const blurPositionAttribute = gl.getAttribLocation(blurProgram, "a_position");
  gl.enableVertexAttribArray(blurPositionAttribute);
  gl.vertexAttribPointer(blurPositionAttribute, 2, gl.FLOAT, false, 0, 0);

  function bloomPass(lod: number, inputTexture: WebGLTexture) {
    const scale = 1 / Math.pow(2, lod);
    gl.uniform2f(
      gl.getUniformLocation(blurProgram, "u_resolution"),
      canvas.width * scale,
      canvas.height * scale
    );
    gl.uniform1f(gl.getUniformLocation(blurProgram, "uLod"), lod);

    const blurFrameBuffer = createRenderTarget(gl, canvas.width * scale, canvas.height * scale);

    // Horizontal blur
    //  gl.bindFramebuffer(gl.FRAMEBUFFER, horizontalBlurFramebuffer.framebuffer);
    //  gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //  gl.clear(gl.COLOR_BUFFER_BIT);
    //  gl.uniform2f(gl.getUniformLocation(blurProgram, "u_direction"), 1, 0);
    //  gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    //  gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Vertical blur
    gl.bindFramebuffer(gl.FRAMEBUFFER, blurFrameBuffer.framebuffer);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(gl.getUniformLocation(blurProgram, "u_direction"), 0, 1);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return blurFrameBuffer;
  }

  const bloomFrameBuffer1 = bloomPass(2, framebuffers[1].texture);
  const bloomFrameBuffer2 = bloomPass(4, framebuffers[1].texture);

  // Combine
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(combineProgram);
  const combinePositionAttribute = gl.getAttribLocation(combineProgram, "a_position");
  gl.enableVertexAttribArray(combinePositionAttribute);
  gl.vertexAttribPointer(combinePositionAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, framebuffers[0].texture);
  gl.uniform1i(gl.getUniformLocation(combineProgram, "u_image"), 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, bloomFrameBuffer1.texture);
  gl.uniform1i(gl.getUniformLocation(combineProgram, "u_bloomTexture1"), 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, bloomFrameBuffer2.texture);
  gl.uniform1i(gl.getUniformLocation(combineProgram, "u_bloomTexture2"), 2);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Initial setup
resizeCanvas();
render();

// Handle window resizing
window.addEventListener("resize", resizeCanvas);
