export interface Point {
  x: number;
  y: number;
}

export interface Warning {
  color: string;
}

export interface Strip {
  id: string; // Unique identifier for the strip
  x: number;
  y: number;
  width: number;
  height: number;
  approachAngle: number; // The desired angle (in radians) to approach/depart this strip
  angleTolerance: number; // How much deviation is allowed (in radians)
}

export const PLANE_CONFIG = {
  SIZE: 40,
  SPEED: 0.4,
  CONFLICT_DISTANCE: 120,
  SCALE_DURATION_MS: 1000,
  TURN_SPEED: 0.1,
  PATH_ACCURACY: 10,
  INITIAL_DEPARTURE_SPEED: 0.5,
  DEPARTURE_PATH_LENGTH: 150,
  MIN_DEPARTURE_INTERVAL_MS: 2000, // <-- NEW: Minimum 2 seconds between departures
};

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  return a + diff * t;
}

export class Plane {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  scale: number;
  scaleDirection: 1 | -1 | 0; // 1 = growing, -1 = shrinking, 0 = stable
  isOffscreen: boolean;
  warning: Warning | null;
  image: HTMLImageElement;
  path: Point[] | null = null;
  pathIndex: number = 0;

  isDeparting: boolean = false;
  isLanding: boolean = false;

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    image: HTMLImageElement,
    initialScale: number = 1,
    initialScaleDirection: 1 | -1 | 0 = 0
  ) {
    this.id = Date.now() + Math.random();
    this.image = image;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;

    this.scale = initialScale;
    this.scaleDirection = initialScaleDirection;
    this.isOffscreen = false;
    this.warning = null;
  }

  resetRandomEdgeSpawn(): void {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0:
        this.x = Math.random() * this.canvasWidth;
        this.y = -PLANE_CONFIG.SIZE;
        break; // Top
      case 1:
        this.x = this.canvasWidth + PLANE_CONFIG.SIZE;
        this.y = Math.random() * this.canvasHeight;
        break; // Right
      case 2:
        this.x = Math.random() * this.canvasWidth;
        this.y = this.canvasHeight + PLANE_CONFIG.SIZE;
        break; // Bottom
      case 3:
        this.x = -PLANE_CONFIG.SIZE;
        this.y = Math.random() * this.canvasHeight;
        break; // Left
    }
    const targetX =
      this.canvasWidth / 2 + (Math.random() - 0.5) * this.canvasWidth * 0.5;
    const targetY =
      this.canvasHeight / 2 + (Math.random() - 0.5) * this.canvasHeight * 0.5;
    this.angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.vx = Math.cos(this.angle) * PLANE_CONFIG.SPEED;
    this.vy = Math.sin(this.angle) * PLANE_CONFIG.SPEED;
    this.scale = 1;
    this.scaleDirection = 0;
    this.isDeparting = false;
    this.isLanding = false;
  }

  // --- MODIFIED Plane.update: No longer takes a single landingStrip, it's checked externally ---
  update(deltaTime: number): void {
    // Handle scaling animation (same as before)
    if (this.scaleDirection !== 0) {
      const scaleChange =
        (deltaTime / PLANE_CONFIG.SCALE_DURATION_MS) * this.scaleDirection;
      this.scale = Math.max(0, Math.min(1, this.scale + scaleChange));

      if (this.scale >= 1 && this.scaleDirection === 1) {
        // Done growing
        this.scaleDirection = 0;
        this.isDeparting = false; // Finished departing process
      }
      if (this.scale <= 0 && this.scaleDirection === -1) {
        // Done shrinking
        this.scaleDirection = 0;
        this.isOffscreen = true; // Plane is effectively "gone" after shrinking
        this.isLanding = false; // Finished landing process
      }
    }

    // Only move the plane if it's visible (not fully shrunk)
    if (this.scale > 0) {
      // Path Following Logic (same as previous)
      if (
        this.path &&
        this.path.length > 0 &&
        this.pathIndex < this.path.length
      ) {
        const targetPoint = this.path[this.pathIndex];
        const distance = Math.sqrt(
          (targetPoint.x - this.x) ** 2 + (targetPoint.y - this.y) ** 2
        );

        if (distance < PLANE_CONFIG.PATH_ACCURACY) {
          this.pathIndex++;
        }
        const currentTarget = this.path[this.pathIndex];
        if (currentTarget) {
          const targetAngle = Math.atan2(
            currentTarget.y - this.y,
            currentTarget.x - this.x
          );
          this.angle = lerpAngle(
            this.angle,
            targetAngle,
            PLANE_CONFIG.TURN_SPEED
          );
        } else {
          this.path = null; // Path complete
        }
      }

      // Adjust speed for departing planes (same as before)
      let currentSpeed = PLANE_CONFIG.SPEED;
      if (this.isDeparting && this.scale < 1) {
        currentSpeed =
          PLANE_CONFIG.INITIAL_DEPARTURE_SPEED +
          (PLANE_CONFIG.SPEED - PLANE_CONFIG.INITIAL_DEPARTURE_SPEED) *
            this.scale;
      }

      this.vx = Math.cos(this.angle) * currentSpeed;
      this.vy = Math.sin(this.angle) * currentSpeed;
      this.x += this.vx;
      this.y += this.vy;

      // --- REMOVED: Landing Strip Detection from here. It's now handled in composable. ---

      // Check if offscreen (only if not shrinking via landing)
      if (this.scaleDirection !== -1) {
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
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    /* ... (no changes) */
    if (this.scale <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.warning) {
      const opacity = 0.4 + Math.sin(Date.now() * 0.005) * 0.3;
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

  isPointOnIcon(point: Point): boolean {
    /* ... (no changes) */
    const distance = Math.sqrt(
      (point.x - this.x) ** 2 + (point.y - this.y) ** 2
    );
    return distance < PLANE_CONFIG.SIZE / 1.5;
  }
}
