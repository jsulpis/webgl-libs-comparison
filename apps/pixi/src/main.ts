import { vertexShader, fragmentShader } from "shaders";

import * as PIXI from "pixi.js";

function flatten<T>(array: T[][]): T[] {
   return array.reduce((acc, val) => acc.concat(val), []);
}

const app = new PIXI.Application({ resizeTo: window });

// @ts-ignore
document.body.appendChild(app.view);

// Build geometry.
const geometry = new PIXI.Geometry()
   .addAttribute(
      "position", // the attribute name
      flatten([
         [0, 0, 0],
         [1, 0, 0],
         [1, 1, 0],
         [0, 1, 0],
      ]),
      3 // the size of the attribute
   )
   .addIndex([0, 1, 2, 0, 2, 3]);

const uniforms = {
   uTime: 0,
};

// Build the shader and the quad.
const shader = PIXI.Shader.from(vertexShader, fragmentShader, uniforms);
const quad = new PIXI.Mesh(geometry, shader);

app.stage.addChild(quad);

// start the animation..
app.ticker.add(() => {
   quad.shader.uniforms.uTime = performance.now() / 500;
});
