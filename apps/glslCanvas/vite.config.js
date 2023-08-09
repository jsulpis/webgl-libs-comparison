import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webgl-tools-comparison/glslCanvas/',
  build: {
    outDir: '../../public/glslCanvas',
    emptyOutDir: true
  },
  plugins: [glsl()]
});