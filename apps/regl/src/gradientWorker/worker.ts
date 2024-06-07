import createREGL from "regl";

const handlers = {
  main,
};

addEventListener("message", function (e) {
  const handler = handlers[e.data.type as keyof typeof handlers];
  handler(e.data.payload);
});

interface MainProps {
  canvas: OffscreenCanvas;
  vertex: string;
  fragment: string;
}

async function main({ canvas, fragment, vertex }: MainProps) {
  // @ts-expect-error createREGL does not accept OffscreenCanvas
  const regl = createREGL({ canvas });

  const draw = regl({
    frag: fragment,
    vert: vertex,
    attributes: {
      aPosition: [
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    },
    elements: [
      [0, 1, 2],
      [0, 2, 3],
    ],
    uniforms: {
      uTime: ({ time }) => time,
    },
  });

  regl.frame(({ time }) => {
    draw({ time });
  });
}
