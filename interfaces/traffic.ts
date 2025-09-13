export interface Point {
  x: number;
  y: number;
}

export interface Warning {
  color: string;
}

export const PLANE_CONFIG = {
  SIZE: 40,
  SPEED: 0.5,
  CONFLICT_DISTANCE: 120,
  SCALE_DURATION_MS: 2000,
  DRAG_CONTROL_ANGLE_DEG: 30,
  DRAG_CONTROL_DISTANCE_MULTIPLIER: 2,
};

export class Plane {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  scale: number;
  scaleDirection: 1 | -1 | 0;
  isDragging: boolean;
  isOffscreen: boolean;
  warning: Warning | null;
  image: HTMLImageElement; // <-- ADD THIS PROPERTY

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    image: HTMLImageElement // <-- ADD IMAGE AS AN ARGUMENT
  ) {
    this.id = Date.now() + Math.random();
    this.image = image; // <-- ASSIGN THE IMAGE
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.reset();
    this.scale = 0;
    this.scaleDirection = 1;
    this.isDragging = false;
    this.isOffscreen = false;
    this.warning = null;
  }

  reset(): void {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0:
        this.x = Math.random() * this.canvasWidth;
        this.y = -PLANE_CONFIG.SIZE;
        break;
      case 1:
        this.x = this.canvasWidth + PLANE_CONFIG.SIZE;
        this.y = Math.random() * this.canvasHeight;
        break;
      case 2:
        this.x = Math.random() * this.canvasWidth;
        this.y = this.canvasHeight + PLANE_CONFIG.SIZE;
        break;
      case 3:
        this.x = -PLANE_CONFIG.SIZE;
        this.y = Math.random() * this.canvasHeight;
        break;
    }

    const targetX =
      this.canvasWidth / 2 + (Math.random() - 0.5) * this.canvasWidth * 0.5;
    const targetY =
      this.canvasHeight / 2 + (Math.random() - 0.5) * this.canvasHeight * 0.5;

    this.angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.vx = Math.cos(this.angle) * PLANE_CONFIG.SPEED;
    this.vy = Math.sin(this.angle) * PLANE_CONFIG.SPEED;
  }

  update(deltaTime: number): void {
    // ... (no changes in this method)
    if (this.scaleDirection !== 0) {
      const scaleChange =
        (deltaTime / PLANE_CONFIG.SCALE_DURATION_MS) * this.scaleDirection;
      this.scale = Math.max(0, Math.min(1, this.scale + scaleChange));
      if (this.scale >= 1 || this.scale <= 0) {
        this.scaleDirection = 0;
      }
    }

    if (!this.isDragging) {
      this.x += this.vx;
      this.y += this.vy;
    }

    const offscreenMargin = PLANE_CONFIG.SIZE * 2;
    if (
      this.x < -offscreenMargin ||
      this.x > this.canvasWidth + offscreenMargin ||
      this.y < -offscreenMargin ||
      this.y > this.canvasHeight + offscreenMargin
    ) {
      this.isOffscreen = true;
    }
  }

  // V-- MODIFY THE DRAW METHOD SIGNATURE AND LOGIC --V
  draw(ctx: CanvasRenderingContext2D): void {
    if (
      this.x < -PLANE_CONFIG.SIZE ||
      this.x > this.canvasWidth + PLANE_CONFIG.SIZE ||
      this.y < -PLANE_CONFIG.SIZE ||
      this.y > this.canvasHeight + PLANE_CONFIG.SIZE ||
      this.scale <= 0
    ) {
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.warning) {
      const blinkSpeed = 0.00005;
      const opacity = 0.4 + Math.sin(Date.now() * blinkSpeed) * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, PLANE_CONFIG.CONFLICT_DISTANCE / 2, 0, Math.PI * 2);
      ctx.fillStyle = `${this.warning.color}${Math.floor(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.fill();
    }

    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);
    // Use the plane's own image property
    ctx.drawImage(
      this.image,
      -PLANE_CONFIG.SIZE / 2,
      -PLANE_CONFIG.SIZE / 2,
      PLANE_CONFIG.SIZE,
      PLANE_CONFIG.SIZE
    );
    ctx.restore();
  }

  isPointInControlZone(point: Point): boolean {
    // ... (no changes in this method)
    const getDistance = (p1: Point, p2: Point) =>
      Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    if (getDistance({ x: this.x, y: this.y }, point) < PLANE_CONFIG.SIZE / 2)
      return true;
    const controlDistance =
      PLANE_CONFIG.SIZE * PLANE_CONFIG.DRAG_CONTROL_DISTANCE_MULTIPLIER;
    const angleRad = (PLANE_CONFIG.DRAG_CONTROL_ANGLE_DEG * Math.PI) / 180;
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > controlDistance) return false;
    const pointAngle = Math.atan2(dy, dx);
    let angleDiff = pointAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    return Math.abs(angleDiff) <= angleRad;
  }
}
