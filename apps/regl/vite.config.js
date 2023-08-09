import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webgl-tools-comparison/regl/',
  build: {
    outDir: '../../public/regl',
  },
  plugins: [glsl()]
});