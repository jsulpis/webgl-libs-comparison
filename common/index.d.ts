declare module "*.glsl" {
  const shader: string;
  export default shader;
}

declare module "common" {
  export const fragmentShader: string;
  export const vertexShader: string;

  type VectorUniform =
    | [number, number]
    | [number, number, number]
    | [number, number, number, number];

  type UniformValue = number | VectorUniform;

  export interface WebGLCanvasProps<Uniforms extends Record<string, UniformValue>> {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    fragment: string;
    vertex: string;
    uniforms: Uniforms;
  }

  export type WebGLCanvasFn = <Uniforms extends Record<string, UniformValue>>(
    props: WebGLCanvasProps<Uniforms>
  ) => {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    uniforms: Uniforms;
    gl: WebGL2RenderingContext;
    setSize: ({ width: number, height: number }) => void;
    setUniform: <U extends Extract<keyof Uniforms, string>>(uniform: U, value: Uniforms[U]) => void;
  };
}
