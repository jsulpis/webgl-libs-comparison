# WebGL Libraries Comparison

## What ?

A comparison of various libs for drawing things with WebGL.

## Why ?

As I learn the fundamentals of WebGL, I am experimenting various techniques for rendering pictures or animations with low-level APIs and shaders (SDF, raymarching, particles...).

I don't need the features of the big WebGL libraries and I like to keep my projects lightweight, so I searched for a sweet spot between ease of use (abstraction of the WebGL boilerplate, modern syntax...), efficiency (light weight, tree shaking...), and support for all environments (SSR, workers...).

## Global requirements

- canvas positionned with CSS (not created by the lib)
- support WebGL 2 (GLSL version 3.30)
- types
- works on the server (SSR/SSG) and on a web worker (OffscreenCanvas)
- control over vertex and fragment shaders
- ability to set uniforms and update their values over time

## Libraries

- **[Native WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)**: the most complex option but also the lightest.
- **[four](https://github.com/CodyJasonBennett/four)**: sits nicely in the spot where you need some basic functionalities like perspective, multiple objects or load external files, but don't need the full power of three.js, while being extremely lightweight.
- **[shree](https://sawa-zen.github.io/shree/)**: roughly identical to four but the repo seems dead.
- **[glslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas)**: probably the best compromise between ease of use, weight and functionality for basic use cases. You can throw a CDN script on an HTML document, provide your shaders and you are good to go without writing any JavaScript code.
- **[ogl](https://github.com/oframe/ogl)**: slightly lower level than four but offers features like orbit controls and built-in meshes
- **[regl](https://github.com/regl-project/regl)**: seems a bit outdated because it's too heavy for simple use cases and for more complex ones three.js is probably a better choice.
- **[three](https://threejs.org/)**: by far the most popular and the default choice for any 3D project that needs more than basic functionalities (_if_ the other solutions above are not enough).
- **[pixi](https://pixijs.com/)**: claims to be the fastest 2D WebGL renderer. I guess it should be reserved for advanced 2D use cases, because it's even heavier than three.

| Library      | Canvas styled in CSS | WebGL 2 | Types | Works on server / worker |
| ------------ | -------------------- | ------- | ----- | ------------------------ |
| native WebGL | ✅                   | ✅      | ✅    | ✅                       |
| four         | ✅                   | ✅      | ✅    |                          |
| shree        | ❌                   | ❌      | ❌    | ❌                       |
| glslCanvas   | ✅                   | ❌      | ❌    | ❌                       |
| ogl          | ✅                   | ✅      | ✅    |                          |
| regl         | ✅                   | ❌      | ✅    |                          |
| three        | ✅                   | ✅      | ✅    | ✅                       |
| pixi         | ✅                   | ✅      | ✅    | ✅                       |

## Use case #1: simple gradient

This is one of the simplest things to draw with WebGL, which allows to compare the syntax and weight of the libraries on a bare bones setup.

<img src="https://github.com/jsulpis/webgl-libs-comparison/assets/22420399/8221b07f-0398-488e-94b2-0561831daadb" width=320 />

### Setup

Basic [shaders](https://github.com/jsulpis/webgl-libs-comparison/blob/main/common/src/shaders/gradient.ts) that display a gradient based on the UV coordinates, with a `uTime` uniform to move the gradient over time.

### Results

Sorted by weight.

| Library      | Demo                                                                                                                                                                          | Weight (resource) | Weight (gzip) | Complexity |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------- | ---------- |
| native WebGL | [live](https://jsulpis.github.io/webgl-libs-comparison/webgl/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/webgl/src/gradient/index.ts)           | 3.2kB             | 1.7kB         | \*\*\*\*\* |
| four         | [live](https://jsulpis.github.io/webgl-libs-comparison/four/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/four/src/gradient/index.ts)             | 18.5kB            | 7.1kB         | \*\*\*     |
| shree        | [live](https://jsulpis.github.io/webgl-libs-comparison/shree/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/shree/src/gradient/index.ts)           | 27.5kB            | 8.5kB         | \*\*\*     |
| glslCanvas   | [live](https://jsulpis.github.io/webgl-libs-comparison/glslCanvas/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/glslCanvas/src/gradient/index.ts) | 28.5kB            | 9.6kB         | \*         |
| ogl          | [live](https://jsulpis.github.io/webgl-libs-comparison/ogl/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/ogl/src/gradient/index.ts)               | 44.5kB            | 13.5kB        | \*\*\*     |
| regl         | [live](https://jsulpis.github.io/webgl-libs-comparison/regl/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/regl/src/gradient/index.ts)             | 125kB             | 42.2kB        | \*\*       |
| three        | [live](https://jsulpis.github.io/webgl-libs-comparison/three/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/three/src/gradient/index.ts)           | 452kB             | 115kB         | \*\*\*     |
| pixi         | [live](https://jsulpis.github.io/webgl-libs-comparison/pixi/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/pixi/src/gradient/index.ts)             | 458kB             | 139kB         | \*\*\*     |
