# WebGL Libraries Comparison

## What ?

A quick comparison of various libs for drawing things with WebGL.

## Why ?

I want to make animations with WebGL shaders, a bit like on [Shadertoy](https://www.shadertoy.com/), but I don't want to use a huge lib for such simple use case. I searched for the most efficient and lightweight way to implement such animation.

## Requirements

-  draw a simple rectangle occupying all the canvas space with given dimensions
-  control over vertex and fragment shaders
-  set uniforms and update their values over time

That's it. No need for perspective, multiple elements, or even 3D.

Bonus point if the lib supports TypeScript because I'm used to using it in real world apps.

## Setup

I created basic [vertex](https://github.com/jsulpis/webgl-libs-comparison/blob/main/shaders/src/vertex.glsl) and [fragment](https://github.com/jsulpis/webgl-libs-comparison/blob/main/shaders/src/fragment.glsl) shaders that display a gradient based on the UV coordinates, with a `time` uniform to move this gradient over time.

I used these shaders to draw on a full screen canvas using the various methods.

## Results

Sorted by weight.

| Method                                                                     | Demo                                                                                                                                                                | Weight (resource) | Weight (gzip) | Types | Complexity   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------- | ----- | ------------ |
| [native WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) | [live](https://jsulpis.github.io/webgl-libs-comparison/webgl/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/webgl/src/main.ts)           | 1.9kB             | 1.1kB         | ✅    | most complex |
| [four](https://github.com/CodyJasonBennett/four)                           | [live](https://jsulpis.github.io/webgl-libs-comparison/four/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/four/src/main.ts)             | 19.4kB            | 7.3kB         | ✅    | complex      |
| [shree](https://sawa-zen.github.io/shree/)                                 | [live](https://jsulpis.github.io/webgl-libs-comparison/shree/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/shree/src/main.ts)           | 27.2kB            | 8.2kB         | ❌    | complex      |
| [glslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas)           | [live](https://jsulpis.github.io/webgl-libs-comparison/glslCanvas/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/glslCanvas/src/main.ts) | 28.6kB            | 9.6kB         | ❌    | simplest     |
| [ogl](https://github.com/oframe/ogl)                                       | [live](https://jsulpis.github.io/webgl-libs-comparison/ogl/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/ogl/src/main.ts)               | 44.3kB            | 13.4kB        | ✅    | complex      |
| [regl](https://github.com/regl-project/regl)                               | [live](https://jsulpis.github.io/webgl-libs-comparison/regl/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/regl/src/main.ts)             | 125kB             | 42.2kB        | ✅    | simple       |
| [three](https://threejs.org/)                                              | [live](https://jsulpis.github.io/webgl-libs-comparison/three/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/three/src/main.ts)           | 437kB             | 111kB         | ✅    | normal       |
| [pixi](https://pixijs.com/)                                                | [live](https://jsulpis.github.io/webgl-libs-comparison/pixi/), [code](https://github.com/jsulpis/webgl-libs-comparison/blob/main/apps/pixi/src/main.ts)             | 453kB             | 137kB         | ✅    | normal       |

## Conclusion

-  **Native WebGL** seems to be the best option for the use case described above. It's hard to write but once it's there we can forget it, and it's way lighter than the other options.
-  **four** sits nicely in the spot where you need some basic functionalities like perspective, multiple objects or load external files, but don't need the full power of three.js, while being extremely lightweight.
-  **shree** is roughly identical to four but the repo seems dead.
-  **glslCanvas** is probably the best compromise between ease of use, weight and functionality for basic use cases. You can throw a CDN script on an HTML document, provide your shaders and you are good to go without writing any JavaScript code.
-  **ogl** is slightly lower level than four but offers features like orbit controls and built-in meshes
-  **regl** seems a bit outdated because it's too heavy for simple use cases and for more complex ones three.js is probably a better choice.
-  **three** is by far the most popular and the default choice for any 3D project that needs more than basic functionalities (_if_ the other solutions above are not enough).
-  **pixi** claims to be the fastest 2D WebGL renderer. I guess it should be reserved for advanced 2D use cases, because it's even heavier than three.
