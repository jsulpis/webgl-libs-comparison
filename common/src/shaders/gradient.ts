export const fragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform float uTime;

void main() {
  gl_FragColor = vec4(vUv, sin(uTime) / 2. + .5, 1.);
}
`;

export const vertex = /* glsl */ `
precision highp float;

attribute vec3 aPosition;
varying vec2 vUv;

void main() {
   vUv = aPosition.xy;
   gl_Position = vec4(2.0 * aPosition - 1.0, 1.0);
}
`;
