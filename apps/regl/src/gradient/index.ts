import createREGL from "regl";
import { vertex, fragment } from "common/src/shaders/gradient.ts";

const canvas = document.querySelector("canvas")!;

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
