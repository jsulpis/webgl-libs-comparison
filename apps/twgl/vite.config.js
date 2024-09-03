import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   base: "/webgl-libs-comparison/twgl/",
   build: {
      outDir: "../../public/twgl",
      emptyOutDir: true,
   },
   plugins: [glsl({ compress: true })],
});
