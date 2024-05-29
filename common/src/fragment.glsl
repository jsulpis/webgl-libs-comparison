#version 300 es

precision highp float;

in vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;

#define BACKGROUND vec3(0)
#define FOREGROUND vec3(1)
#define BIG_CIRCLE_CENTER vec2(0)
#define BIG_CIRCLE_RADIUS .6
#define PI acos(-1.)

float sdCircle(in vec2 p, in float r) {
  return length(p) - r;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.f) / k;
  return min(a, b) - h * h * h * k * 1.f / 6.f;
}

void main() {
  float edgePrecision = 2.f / uResolution.y;

  float speedFactor = 2.f;
  float bigCirclePerimeter = 2.f * PI * BIG_CIRCLE_RADIUS;

  float angle = uTime * speedFactor;
  vec2 smallCircleCenter = vec2(cos(angle), sin(angle)) * BIG_CIRCLE_RADIUS * .3f;
  float smallCircleRadius = BIG_CIRCLE_RADIUS * .2f;

  float bigCircle = sdCircle(vUv - BIG_CIRCLE_CENTER, BIG_CIRCLE_RADIUS);
  float smallCircle = sdCircle(vUv - smallCircleCenter, smallCircleRadius);

  vec3 col = BACKGROUND;

  col = mix(col, FOREGROUND, smoothstep(edgePrecision, 0.f, smin(bigCircle, smallCircle, 1.0f)));
  col = mix(col, BACKGROUND, 1.f - smoothstep(0.f, edgePrecision, bigCircle));

  fragColor = vec4(col, 1.0f);
}