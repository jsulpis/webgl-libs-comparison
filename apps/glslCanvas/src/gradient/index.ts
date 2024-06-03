import GlslCanvas from "glslCanvas";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

const sandbox = new GlslCanvas(document.querySelector("canvas"));

sandbox.load(fragment, vertex);

requestAnimationFrame(function animate() {
  requestAnimationFrame(animate);

  sandbox.setUniform("uTime", performance.now() / 500);
});
