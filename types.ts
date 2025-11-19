export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface RenderParams {
  hexagonSize: number;
  hexagonGap: number;
  thinStroke: number;
  thickStroke: number;
  vertexSize: number;
  thinOpacity: number;
  thickColor: string;
  thinColor: string;
  vertexColor: string;
  flickerSpeed: number;
  flickerAmount: number;
  gridColor: string;
  gridStrokeWidth: number;
  gridOpacity: number;
}