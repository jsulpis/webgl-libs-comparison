import createREGL from "regl";

import { vertexShader as vert, fragmentShader as frag } from "common";

const regl = createREGL();

const draw = regl({
   frag,
   vert,
   attributes: {
      position: [
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
      // or
      // time: regl.prop('time'),
   },
});

regl.frame(({ time }) => {
   // provide custom uniform values at each frame
   draw({ time });
});
