import { vertexShader, fragmentShader } from "shaders";
import GlslCanvas from "glslCanvas";

const sandbox = new GlslCanvas(document.querySelector("canvas"));

sandbox.load(fragmentShader, vertexShader);

requestAnimationFrame(function animate() {
   requestAnimationFrame(animate);

   sandbox.setUniform("uTime", performance.now() / 500);
});
