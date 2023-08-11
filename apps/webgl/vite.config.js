import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   base: "/webgl-tools-comparison/webgl/",
   build: {
      outDir: "../../public/webgl",
      emptyOutDir: true,
   },
   plugins: [glsl()],
});
