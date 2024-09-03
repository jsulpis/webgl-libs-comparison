# WebGL Libraries Comparison

## What ?

A comparison of various libs for drawing things with WebGL.

## Why ?

As I learn the fundamentals of WebGL, I am experimenting various techniques for rendering pictures or animations with low-level APIs and shaders (SDF, raymarching, particles...).

I don't need the features of the big WebGL libraries and I like to keep my projects lightweight, so I searched for a sweet spot between ease of use (abstraction of the WebGL boilerplate, modern syntax...), efficiency (light weight, tree shaking...), and support for all environments (SSR, workers...).

## Global requirements

-  canvas positionned and sized in CSS (not created by the lib)
-  support for WebGL 2 (GLSL version 3.30)
-  types
-  works on the server (SSR/SSG) and on a web worker (OffscreenCanvas)
-  control over vertex and fragment shaders
-  ability to set uniforms and update their values over time

## Libraries

-  **[Native WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)**: the most complex option but also the lightest.
-  **[TWGL](https://twgljs.org/)** : a lightweight library that provides abstractions over the native WebGL API.
-  **[four](https://github.com/CodyJasonBennett/four)**: sits nicely in the spot where you need some basic functionalities like perspective, multiple objects or load external files, but don't need the full power of three.js, while being extremely lightweight.
-  **[shree](https://sawa-zen.github.io/shree/)**: roughly identical to four but the repo seems dead.
-  **[glslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas)**: probably the best compromise between ease of use, weight and functionality for basic use cases. You can throw a CDN script on an HTML document, provide your shaders and you are good to go without writing any JavaScript code.
-  **[ogl](https://github.com/oframe/ogl)**: slightly lower level than four but offers features like orbit controls and built-in meshes
-  **[regl](https://github.com/regl-project/regl)**: seems a bit outdated because it's too heavy for simple use cases and for more complex ones three.js is probably a better choice.
-  **[three](https://threejs.org/)**: by far the most popular and the default choice for any 3D project that needs more than basic functionalities (_if_ the other solutions above are not enough).
-  **[pixi](https://pixijs.com/)**: claims to be the fastest 2D WebGL renderer. I guess it should be reserved for advanced 2D use cases, because it's even heavier than three.

| Library      | Canvas styled in CSS | WebGL 2 | Types | Works on server / worker | Complexity |
| ------------ | -------------------- | ------- | ----- | ------------------------ | ---------- |
| native WebGL | ✅                   | ✅      | ✅    | ✅                       | \*\*\*\*   |
| TWGL         | ✅                   | 🟧      | ✅    | ✅                       | \*\*\*     |
| four         | ✅                   | ✅      | ✅    | 🟧                       | \*\*\*     |
| shree        | ❌                   | ❌      | ❌    | ❌                       | \*\*\*     |
| glslCanvas   | ✅                   | ❌      | ❌    | ❌                       | \*         |
| ogl          | ✅                   | ✅      | ✅    | ✅                       | \*\*\*     |
| regl         | ✅                   | ❌      | ✅    | ✅                       | \*\*       |
| three        | ✅                   | ✅      | ✅    | ✅                       | \*\*\*     |
| pixi         | ✅                   | ✅      | ✅    | ✅                       | \*\*\*     |

## Benchmark #1: simple animated gradient

<a href="https://jsulpis.github.io/webgl-libs-comparison/regl/">
   <img src="https://github.com/jsulpis/webgl-libs-comparison/assets/22420399/8221b07f-0398-488e-94b2-0561831daadb" width=320 />
</a>

This is one of the simplest things to draw with WebGL, which allows to compare the syntax and weight of the libraries on a bare bones setup.

### Use case

A render made with a fragment shader using only the UV coordinates given by the vertex shader, and optionally a `uTime` uniform to make an animation.

### Results

Sorted by weight.

| Library      | Code                                                                                                     | Weight (resource) | Weight (gzip) |
| ------------ | -------------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
| native WebGL | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/webgl/src/gradient/index.ts)      | 3.2kB             | 1.7kB         |
| four         | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/four/src/gradient/index.ts)       | 18.5kB            | 7.1kB         |
| TWGL         | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/twgl/src/gradient/index.ts)       | 20.6kB            | 7.2kB         |
| shree        | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/shree/src/gradient/index.ts)      | 27.5kB            | 8.5kB         |
| glslCanvas   | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/glslCanvas/src/gradient/index.ts) | 28.5kB            | 9.6kB         |
| ogl          | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/ogl/src/gradient/index.ts)        | 44.5kB            | 13.5kB        |
| regl         | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/regl/src/gradient/index.ts)       | 125kB             | 42.2kB        |
| three        | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/three/src/gradient/index.ts)      | 452kB             | 115kB         |
| pixi         | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/pixi/src/gradient/index.ts)       | 458kB             | 139kB         |

### Thoughts

-  Three and Pixi are way too heavy for this use case, and this is obviously not what they are made for. Regl is also too heavy in my opinion.
-  among the off-the-shelf libraries, glslCanvas is by far the easiest to use, but it's surprisingly heavier than four or shree.
-  four, shree and ogl are quite similar, ogl being a little lower-level, and four closer to three.js.
-  Native WebGL is really light, and with the little helper that I made (`useWebGLCanvas`), the usage is really easy. I think this is the solution that I would pick for this use case.

## Benchmark #2: blob animation with mouse interaction

<a href="https://jsulpis.github.io/webgl-libs-comparison/four/">
   <img src="https://github.com/jsulpis/webgl-libs-comparison/assets/22420399/2cb0aba0-b467-4d71-8559-a28442dfc15f" width="320" />
</a>

A little animation in a fragment shader using user input.

### Use case

A render a little more complex made with a fragment shader and using the UV coordinates, a `uTime` uniform and another one driven by user input.

It's similar to the previous benchmark, just a little closer to a real world scenario. And the user input is important to test the usage in a web worker, because unlike for the time, a web worker cannot watch user interactions. So there has to be messages between the main and worker scripts.

### Results

Sorted by weight.

shree, glslCanvas and regl are excluded from this benchmark and the next ones, because they lack some features that I want (support for WebGL2, usage in web worker...).

| Library      | Code                                                                                            | Weight (resource) | Weight (gzip) | Web Worker |
| ------------ | ----------------------------------------------------------------------------------------------- | ----------------- | ------------- | ---------- |
| native WebGL | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/webgl/src/blob/index.ts) | 6kB               | 2.7kB         | ✅         |
| four         | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/four/src/blob/index.ts)  | 21.3kB            | 8kB           | 🟧         |
| ogl          | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/ogl/src/blob/index.ts)   | 47.3kB            | 14.6kB        | ✅         |
| three        | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/three/src/blob/index.ts) | 454kB             | 116kB         | ✅         |
| pixi         | [link](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/pixi/src/blob/index.ts)  | 461kB             | 140kB         | ✅         |

### Thoughts

-  all projects gained roughly 1kB, which is the weight of the project-specific code, so nothing surprising here.
-  four seems to have an issue in a web worker that breaks synchronous ES imports, forcing to use dynamic `import()`. This is a little inconvenient but it's still possible to make it work.
-  four and ogl renderers don't accept a canvas of type OffscreenCanvas
