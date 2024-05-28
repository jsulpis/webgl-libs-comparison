import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   base: "/webgl-libs-comparison/ogl/",
   build: {
      outDir: "../../public/ogl",
      emptyOutDir: true,
   },
   plugins: [glsl({ compress: true })],
});
