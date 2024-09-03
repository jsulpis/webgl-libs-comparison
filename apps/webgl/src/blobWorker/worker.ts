import { useBasicWebGLCanvas } from "../useWebGLCanvas";

const handlers = {
  main,
  mouseUpdate,
  canvasResize,
};

addEventListener("message", function (e) {
  const handler = handlers[e.data.type as keyof typeof handlers];
  handler(e.data.payload);
});

let ctx: ReturnType<typeof useBasicWebGLCanvas> & { uniforms: typeof defaultUniforms };
let defaultUniforms = {
  uMouse: [0, 0] as [number, number],
  uResolution: [0, 0] as [number, number],
};

interface MainProps {
  canvas: OffscreenCanvas;
  vertex: string;
  fragment: string;
}

function main({ canvas, fragment, vertex }: MainProps) {
  ctx = useBasicWebGLCanvas({
    canvas,
    vertex,
    fragment,
    uniforms: defaultUniforms,
  });
}

function mouseUpdate({ x, y }: { x: number; y: number }) {
  const currentMouse = ctx.uniforms.uMouse;
  ctx.uniforms.uMouse = [
    currentMouse[0] + (x - currentMouse[0]) * 0.05,
    currentMouse[1] + (y - currentMouse[1]) * 0.05,
  ];
}

function canvasResize(size: { width: number; height: number }) {
  ctx.setSize(size);
}
