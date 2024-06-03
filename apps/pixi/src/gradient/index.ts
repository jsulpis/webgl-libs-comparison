import * as PIXI from "pixi.js";
import { onCanvasResize, flatten } from "common";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

const canvas = document.querySelector("canvas")!;

const app = new PIXI.Application({ view: canvas });

const geometry = new PIXI.Geometry()
  .addAttribute(
    "aPosition", // the attribute name
    flatten([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]),
    2 // the size of the attribute
  )
  .addIndex([0, 1, 2, 0, 2, 3]);

const uniforms = {
  uTime: 0,
};

const shader = PIXI.Shader.from(vertex, fragment, uniforms);
const quad = new PIXI.Mesh(geometry, shader);

app.stage.addChild(quad);

app.ticker.add(() => {
  quad.shader.uniforms.uTime = performance.now() / 500;
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  app.renderer.resize(devicePixelSize.width, devicePixelSize.height);
});
