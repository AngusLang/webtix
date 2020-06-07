import { GPUPipeline } from '../webgl/pipeline';
import { GPUDevice } from '../device';
import { GPUVertexArray } from '../webgl/vertex-array';
import { createScreenQuad } from '../utils/prefab';

export class Renderer {

  device: GPUDevice;
  pipeline?: GPUPipeline;

  width: number;
  height: number;

  private screenQuadVertexArray: GPUVertexArray;

  private frame_index: number = 0;
  private sample_count: number = 1;

  constructor(canvas: HTMLCanvasElement) {

    const context = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false }) as WebGL2RenderingContext;
    if (!context) {
      throw 'Require WebGL2 Support.';
    }

    this.device = new GPUDevice(context);

    const ratio = window.devicePixelRatio
    this.width = canvas.width * ratio;
    this.height = canvas.height * ratio;
    canvas.width = this.width;
    canvas.height = this.height;

    context.viewport(0, 0, this.width, this.height);
  
    this.device.getExtension('EXT_color_buffer_float');
    this.device.getExtension('OES_texture_float_linear');

    canvas.oncontextmenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.screenQuadVertexArray = createScreenQuad(this.device);
  }

  frame(): void {
    if (this.frame_index++ >= this.sample_count) {
      return;
    }

    if (this.pipeline) {
      const gl = this.device.getContext<WebGL2RenderingContext>();
      this.screenQuadVertexArray.activate();
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
    }
  }

  setPipeline(pipeline: GPUPipeline): void {
    this.pipeline = pipeline;
    this.pipeline.activate();
  }

  start = (): void  => {
    this.frame();
    requestAnimationFrame(this.start);
  }
}
