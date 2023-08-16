import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   base: "/webgl-tools-comparison/pixi/",
   build: {
      outDir: "../../public/pixi",
      emptyOutDir: true,
   },
   plugins: [glsl()],
});
