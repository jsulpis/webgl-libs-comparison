import {
   createBuffer,
   createRenderTarget,
   createProgram,
   setRenderTarget,
   createRenderPass,
} from "../useWebGLCanvas";

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

const mipmapFragmentShaderSource = /*glsl*/ `#version 300 es
   precision mediump float;
   uniform sampler2D u_image;
   uniform vec2 u_resolution;
   
   in vec2 v_texCoord;
   in vec2 vUv;
   out vec4 outColor;

   vec2 CalcOffset(float octave) {
      vec2 offset = vec2(0.0);
      vec2 padding = vec2(10.0) / u_resolution.xy;
      
      offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);
      
      offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;
      offset.y += min(1.0, floor(octave / 3.0)) * (0.35 + padding.y);
      
      return offset;   
   }


   vec3 mipmapLevel(float octave) {
      float scale = exp2(octave);   
      vec2 offset = CalcOffset(octave - 1.);
      vec2 coord = (v_texCoord + offset) * scale;

      if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
         return vec3(0.0);   
      }
      
      vec3 color = vec3(0.0);
      float weights = 0.0;

      int spread = int(scale);
      
      for (int i = 0; i < spread; i++) {    	    
         for (int j = 0; j < spread; j++) {
            vec2 off = (vec2(i, j) / u_resolution.xy + vec2(0.0) / u_resolution.xy) * scale / float(spread);
            color += texture(u_image, coord + off).rgb; 
               
            weights += 1.0;
         }
      }
      
      color /= weights;
      
      return color;
   }
    
    void main() {
      vec3 color = mipmapLevel(1.0);
      color += mipmapLevel(2.0);
      color += mipmapLevel(3.0);
      color += mipmapLevel(4.0);
   
      outColor = vec4(color, 1.0);
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

   vec3 ColorFetch(vec2 coord) {
 	   return texture(u_image, coord).rgb;   
   }

   float weights[5];
   float offsets[5];


   void main() {
      weights[0] = 0.19638062;
      weights[1] = 0.29675293;
      weights[2] = 0.09442139;
      weights[3] = 0.01037598;
      weights[4] = 0.00025940;
      
      offsets[0] = 0.00000000;
      offsets[1] = 1.41176471;
      offsets[2] = 3.29411765;
      offsets[3] = 5.17647059;
      offsets[4] = 7.05882353;
    
    vec2 uv = v_texCoord;
    
    vec3 color = vec3(0.0);
    float weightSum = 0.0;
    
    if (uv.x < 0.52) {
        color += ColorFetch(uv) * weights[0];
        weightSum += weights[0];

        for(int i = 1; i < 5; i++)
        {
            vec2 offset = vec2(offsets[i]) / u_resolution.xy;
            color += ColorFetch(uv + offset * .5 * u_direction) * weights[i];
            color += ColorFetch(uv - offset * .5 * u_direction) * weights[i];
            weightSum += weights[i] * 2.0;
        }

        color /= weightSum;
    }

    outColor = vec4(color,1.0);
   }
`;

const combineFragmentShaderSource = /* glsl */ `#version 300 es
   precision mediump float;
   uniform sampler2D u_image;
   uniform sampler2D u_bloomTexture1;
   uniform sampler2D u_bloomTexture2;
   uniform vec2 u_resolution;
   in vec2 v_texCoord;
   out vec4 outColor;



vec3 ColorFetch(vec2 coord) {
 	return texture(u_image, coord).rgb;   
}

vec3 BloomFetch(vec2 coord) {
 	return texture(u_bloomTexture1, coord).rgb;
}


vec3 Grab(vec2 coord, const float octave, const vec2 offset)
{
 	float scale = exp2(octave);
    
    coord /= scale;
    coord -= offset;

    return BloomFetch(coord);
}

vec2 CalcOffset(float octave) {
   vec2 offset = vec2(0.0);
    
   vec2 padding = vec2(10.0) / u_resolution.xy;
    
   offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);
    
   offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;
	offset.y += min(1.0, floor(octave / 3.0)) * (0.35 + padding.y);
    
 	return offset + .5 / u_resolution.xy;
}

vec3 GetBloom(vec2 coord) {
 	vec3 bloom = vec3(0.0);
    
   //Reconstruct bloom from multiple blurred images
   bloom += Grab(coord, 1.0, vec2(CalcOffset(0.0))) * .8;
   //  bloom += Grab(coord, 2.0, vec2(CalcOffset(1.0))) * .4;
	bloom += Grab(coord, 3.0, vec2(CalcOffset(2.0))) * .5;
   bloom += Grab(coord, 4.0, vec2(CalcOffset(3.0))) * 1.2;

	return bloom;
}
    
   void main() {
      vec4 baseColor = texture(u_image, v_texCoord);
      vec4 bloomColor = vec4(GetBloom(v_texCoord), 1);

      outColor = baseColor;

      outColor = baseColor + bloomColor;
   }
`;

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
   alert("Unable to initialize WebGL. Your browser may not support it.");
}
// Create programs
// const mainProgram = createProgram(gl, {
//    vertex: vertexShaderSource,
//    fragment: fragmentShaderSource,
// });
// const mipmapProgram = createProgram(gl, {
//    vertex: quadVertexShaderSource,
//    fragment: mipmapFragmentShaderSource,
// });
const blurProgram = createProgram(gl, {
   vertex: quadVertexShaderSource,
   fragment: blurFragmentShaderSource,
});
const combineProgram = createProgram(gl, {
   vertex: quadVertexShaderSource,
   fragment: combineFragmentShaderSource,
});

// Create buffers and textures
const positions: number[] = [];
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
// const positionBuffer = createBuffer(gl, new Float32Array(positions));

// Create a buffer for the full-screen quad
// const quadBuffer = createBuffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]));

function render() {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   // const particlesTarget = createRenderTarget(gl);
   // const mipmapsTarget = createRenderTarget(gl);

   // Render particles to first framebuffer
   // setRenderTarget(gl, particlesTarget);

   const particlesPass = createRenderPass(gl, {
      fragment: fragmentShaderSource,
      vertex: vertexShaderSource,
      attributes: {
         a_position: {
            data: new Float32Array(positions),
            size: 2,
         },
      },
   });

   particlesPass.render({ mode: gl.POINTS });

   // gl.useProgram(mainProgram);
   // const positionAttributeLocation = gl.getAttribLocation(mainProgram, "a_position");
   // gl.enableVertexAttribArray(positionAttributeLocation);
   // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   // gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
   // gl.drawArrays(gl.POINTS, 0, particleCount);

   const mipmapsPass = createRenderPass(gl, {
      fragment: mipmapFragmentShaderSource,
      uniforms: {
         u_resolution: [canvas.width, canvas.height],
         u_image: particlesPass.target.texture,
      },
   });

   mipmapsPass.render();

   // Mipmaps
   // setRenderTarget(gl, mipmapsTarget);
   // gl.useProgram(mipmapProgram);
   // gl.uniform2f(gl.getUniformLocation(mipmapProgram, "u_resolution"), canvas.width, canvas.height);
   // gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
   // const thresholdPositionAttribute = gl.getAttribLocation(mipmapProgram, "a_position");
   // gl.enableVertexAttribArray(thresholdPositionAttribute);
   // gl.vertexAttribPointer(thresholdPositionAttribute, 2, gl.FLOAT, false, 0, 0);
   // gl.bindTexture(gl.TEXTURE_2D, particlesPass.target.texture);
   // gl.drawArrays(gl.TRIANGLES, 0, 6);

   const horizontalBlurPass = createRenderPass(gl, {
      fragment: blurFragmentShaderSource,
      uniforms: {
         u_resolution: [canvas.width, canvas.height],
         u_direction: [1, 0],
         u_image: mipmapsPass.target.texture,
      },
   });

   horizontalBlurPass.render();

   const verticalBlurPass = createRenderPass(gl, {
      fragment: blurFragmentShaderSource,
      uniforms: {
         u_resolution: [canvas.width, canvas.height],
         u_direction: [0, 1],
         u_image: horizontalBlurPass.target.texture,
      },
   });

   verticalBlurPass.render();

   // gl.useProgram(blurProgram);
   // const blurPositionAttribute = gl.getAttribLocation(blurProgram, "a_position");
   // gl.enableVertexAttribArray(blurPositionAttribute);
   // gl.vertexAttribPointer(blurPositionAttribute, 2, gl.FLOAT, false, 0, 0);

   // gl.uniform2f(gl.getUniformLocation(blurProgram, "u_resolution"), canvas.width, canvas.height);

   // const horizontalBlurTarget = createRenderTarget(gl);
   // const verticalBlurTarget = createRenderTarget(gl);

   // Horizontal blur
   // setRenderTarget(gl, horizontalBlurTarget);
   // gl.uniform2f(gl.getUniformLocation(blurProgram, "u_direction"), 1, 0);
   // gl.bindTexture(gl.TEXTURE_2D, mipmapsPass.target.texture);
   // gl.drawArrays(gl.TRIANGLES, 0, 6);

   // Vertical blur
   // setRenderTarget(gl, verticalBlurTarget);
   // gl.uniform2f(gl.getUniformLocation(blurProgram, "u_direction"), 0, 1);
   // gl.bindTexture(gl.TEXTURE_2D, horizontalBlurTarget.texture);
   // gl.drawArrays(gl.TRIANGLES, 0, 6);

   const combinePass = createRenderPass(gl, {
      target: null,
      fragment: combineFragmentShaderSource,
      uniforms: {
         u_resolution: [canvas.width, canvas.height],
         u_image: particlesPass.target.texture,
         u_bloomTexture1: verticalBlurPass.target.texture,
      },
   });

   combinePass.render();

   // Combine
   // setRenderTarget(gl, null);
   // gl.useProgram(combineProgram);
   // const combinePositionAttribute = gl.getAttribLocation(combineProgram, "a_position");
   // gl.enableVertexAttribArray(combinePositionAttribute);
   // gl.vertexAttribPointer(combinePositionAttribute, 2, gl.FLOAT, false, 0, 0);
   // gl.activeTexture(gl.TEXTURE0);
   // gl.bindTexture(gl.TEXTURE_2D, particlesPass.target.texture);
   // gl.uniform1i(gl.getUniformLocation(combineProgram, "u_image"), 0);
   // gl.uniform2f(gl.getUniformLocation(combineProgram, "u_resolution"), canvas.width, canvas.height);
   // gl.activeTexture(gl.TEXTURE1);
   // gl.bindTexture(gl.TEXTURE_2D, verticalBlurPass.target.texture);
   // gl.uniform1i(gl.getUniformLocation(combineProgram, "u_bloomTexture1"), 1);
   // gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Initial setup
// render();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesPass = createRenderPass(gl, {
   fragment: fragmentShaderSource,
   vertex: vertexShaderSource,
   attributes: {
      a_position: {
         data: new Float32Array(positions),
         size: 2,
      },
   },
});

const mipmapsPass = createRenderPass(gl, {
   fragment: mipmapFragmentShaderSource,
   uniforms: {
      u_resolution: [canvas.width, canvas.height],
      u_image: particlesPass.target.texture,
   },
});

const horizontalBlurPass = createRenderPass(gl, {
   fragment: blurFragmentShaderSource,
   uniforms: {
      u_resolution: [canvas.width, canvas.height],
      u_direction: [1, 0],
      u_image: mipmapsPass.target.texture,
   },
});

const verticalBlurPass = createRenderPass(gl, {
   fragment: blurFragmentShaderSource,
   uniforms: {
      u_resolution: [canvas.width, canvas.height],
      u_direction: [0, 1],
      u_image: horizontalBlurPass.target.texture,
   },
});

const combinePass = createRenderPass(gl, {
   target: null,
   fragment: combineFragmentShaderSource,
   uniforms: {
      u_resolution: [canvas.width, canvas.height],
      u_image: particlesPass.target.texture,
      u_bloomTexture1: verticalBlurPass.target.texture,
   },
});

particlesPass.render({ mode: gl.POINTS });
mipmapsPass.render();
horizontalBlurPass.render();
verticalBlurPass.render();
combinePass.render();
