import { onCanvasResize } from "common";
import { vertex, fragment } from "common/src/shaders/bloom.ts";
import { createRenderTarget, loop, setRenderTarget, useBasicWebGLCanvas } from "../useWebGLCanvas";

const canvas = document.querySelector("canvas");

const { setSize, uniforms, render, gl } = useBasicWebGLCanvas({
  canvas,
  vertex,
  fragment,
  uniforms: { uTime: 0 },
});

loop((deltaTime) => {
  uniforms.uTime += deltaTime / 500;

  const { framebuffer, texture } = createRenderTarget(gl, {
    width: canvas.width,
    height: canvas.height,
  });
  setRenderTarget(gl, { framebuffer, width: canvas.width, height: canvas.height });

  gl.bindTexture(gl.TEXTURE_2D, texture);

  setRenderTarget(gl, { framebuffer: null, width: canvas.width, height: canvas.height });
  render();
});

onCanvasResize(canvas, ({ devicePixelSize }) => {
  setSize(devicePixelSize);
});
