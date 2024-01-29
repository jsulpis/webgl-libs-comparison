import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webgl-libs-comparison/regl/',
  build: {
    outDir: '../../public/regl',
    emptyOutDir: true
  },
  plugins: [glsl()]
});