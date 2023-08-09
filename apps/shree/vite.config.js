import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webgl-tools-comparison/shree/',
  build: {
    outDir: '../../public/shree',
  },
  plugins: [glsl()]
});