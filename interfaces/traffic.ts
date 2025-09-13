export interface Point {
  x: number;
  y: number;
}

export interface Warning {
  color: string;
}

export const PLANE_CONFIG = {
  SIZE: 40,
  SPEED: 0.4,
  CONFLICT_DISTANCE: 120,
  SCALE_DURATION_MS: 1500,
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
  isPathPlanning: boolean; // <-- REPLACED isDragging
  isOffscreen: boolean;
  warning: Warning | null;
  image: HTMLImageElement;

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    image: HTMLImageElement
  ) {
    this.id = Date.now() + Math.random();
    this.image = image;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.reset();
    this.scale = 0;
    this.scaleDirection = 1;
    this.isPathPlanning = false; // <-- NEW PROPERTY
    this.isOffscreen = false;
    this.warning = null;
  }

  reset(): void {
    /* ... (no changes in this method) */
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
    if (this.scaleDirection !== 0) {
      const scaleChange =
        (deltaTime / PLANE_CONFIG.SCALE_DURATION_MS) * this.scaleDirection;
      this.scale = Math.max(0, Math.min(1, this.scale + scaleChange));
      if (this.scale >= 1 || this.scale <= 0) this.scaleDirection = 0;
    }

    // Only move the plane if a path is NOT being planned for it
    if (!this.isPathPlanning) {
      // <-- UPDATED CONDITION
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

  draw(ctx: CanvasRenderingContext2D): void {
    /* ... (no changes in this method) */
    if (
      this.x < -PLANE_CONFIG.SIZE ||
      this.x > this.canvasWidth + PLANE_CONFIG.SIZE ||
      this.y < -PLANE_CONFIG.SIZE ||
      this.y > this.canvasHeight + PLANE_CONFIG.SIZE ||
      this.scale <= 0
    )
      return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.warning) {
      const blinkSpeed = 0.005;
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
    ctx.drawImage(
      this.image,
      -PLANE_CONFIG.SIZE / 2,
      -PLANE_CONFIG.SIZE / 2,
      PLANE_CONFIG.SIZE,
      PLANE_CONFIG.SIZE
    );
    ctx.restore();
  }

  // V-- RENAMED AND SIMPLIFIED THIS METHOD --V
  isPointOnIcon(point: Point): boolean {
    const distance = Math.sqrt(
      (point.x - this.x) ** 2 + (point.y - this.y) ** 2
    );
    // Check if the click is within half the plane's size (i.e., on the icon)
    return distance < PLANE_CONFIG.SIZE / 1.5; // A little more generous than / 2
  }
}
