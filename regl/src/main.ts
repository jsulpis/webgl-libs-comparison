import createREGL from "regl";
import frag from "./shaders/frag.glsl";
import vert from "./shaders/vert.glsl";

const regl = createREGL();

const draw = regl({
   frag,
   vert,
   attributes: {
      position: [-2, 0, 0, -2, 2, 2],
   },
   uniforms: {
      time: ({ time }) => time,
      // or
      // time: regl.prop('time'),
   },
   count: 3,
});

regl.frame(({ time }) => {
   // provide custom uniform values at each frame
   draw({ time });
});
