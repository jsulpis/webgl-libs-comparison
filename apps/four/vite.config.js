import topLevelAwait from "vite-plugin-top-level-await";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   base: "/webgl-libs-comparison/four/",
   build: {
      outDir: "../../public/four",
      emptyOutDir: true,
   },
   plugins: [glsl(), topLevelAwait()], // top-level await present in the "four" library
});
