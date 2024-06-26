import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   base: "/webgl-libs-comparison/three/",
   build: {
      outDir: "../../public/three",
      emptyOutDir: true,
   },
   plugins: [glsl({ compress: true })],
});
