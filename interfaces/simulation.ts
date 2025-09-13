export interface Point {
  x: number;
  y: number;
}

export interface PlaneOptions {
  position: Point;
  velocity: Point;
  size: number;
  color: string;
  // For entrance animation
  initialScale?: number;
}

export interface WarningCircle {
  center: Point;
  radius: number;
  opacity: number;
  hue: number;
}
