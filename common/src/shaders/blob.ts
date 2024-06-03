export const fragment = /* glsl */ `#version 300 es

precision highp float;

in vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
out vec4 fragColor;

#define BACKGROUND vec3(0)
#define FOREGROUND vec3(1)
#define BIG_CIRCLE_CENTER vec2(0)
#define BIG_CIRCLE_RADIUS .4
#define PI acos(-1.)

float sdCircle(in vec2 p, in float r) {
  return length(p) - r;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.f) / k;
  return min(a, b) - h * h * h * k * 1.f / 6.f;
}

vec2 getSmallCircleCenter() {
  vec2 centerToMouse = uMouse - BIG_CIRCLE_CENTER;
  float rotation = atan(centerToMouse.y, centerToMouse.x);
  if(centerToMouse.x == 0.f) {
    if(centerToMouse.y < 0.f)
      rotation = -PI / 2.f;
    else if(centerToMouse.y > 0.f)
      rotation = PI / 2.f;
    else
      rotation = 0.f;
  }

  vec2 ellipseCenter = (BIG_CIRCLE_CENTER * .4f + uMouse * .6f);
  float distCenterToMouse = length(uMouse - BIG_CIRCLE_CENTER);
  float rSmall = BIG_CIRCLE_RADIUS * .2f + distCenterToMouse * .2f;
  float rLarge = BIG_CIRCLE_RADIUS * .4f + distCenterToMouse * .4f;
  float t = uTime * 2.f;

  return vec2(//
  rLarge * cos(t) * cos(rotation) - rSmall * sin(t) * sin(rotation) + ellipseCenter.x, //
  rLarge * cos(t) * sin(rotation) + rSmall * sin(t) * cos(rotation) + ellipseCenter.y//
  );
}

void main() {
  float edgePrecision = 2.f / uResolution.y;

  float smallCircleRadius = BIG_CIRCLE_RADIUS * .2f;
  vec2 smallCircleCenter = getSmallCircleCenter();

  float bigCircle = sdCircle(vUv - BIG_CIRCLE_CENTER, BIG_CIRCLE_RADIUS);
  float smallCircle = sdCircle(vUv - smallCircleCenter, smallCircleRadius);
  float mouseCircle = sdCircle(vUv - uMouse, smallCircleRadius / 2.f);

  vec3 col = BACKGROUND;

  col = mix(col, FOREGROUND, smoothstep(edgePrecision, 0.f, smin(bigCircle, smallCircle, BIG_CIRCLE_RADIUS * 2.f)));
  col = mix(col, BACKGROUND, 1.f - smoothstep(0.f, edgePrecision, bigCircle));
  col = mix(col, vec3(1, 0, 0), 1.f - smoothstep(0.f, edgePrecision, mouseCircle));

  fragColor = vec4(col, 1.0f);
}
`;

export const vertex = /* glsl*/ `#version 300 es

precision highp float;

in vec3 aPosition;
uniform vec2 uResolution;
out vec2 vUv;

void main() {
   vUv = (2.f * aPosition.xy - 1.f) * uResolution / uResolution.y;

   gl_Position = vec4(2.0f * aPosition - 1.0f, 1.0f);
}
`;
