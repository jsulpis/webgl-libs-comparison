precision mediump float;

varying vec2 uv;
uniform float time;

void main() {
  gl_FragColor = vec4(uv, sin(time), 1.);
}