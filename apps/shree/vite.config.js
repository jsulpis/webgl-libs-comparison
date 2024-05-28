import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   base: "/webgl-libs-comparison/shree/",
   build: {
      outDir: "../../public/shree",
      emptyOutDir: true,
   },
   plugins: [glsl({ compress: true })],
});
