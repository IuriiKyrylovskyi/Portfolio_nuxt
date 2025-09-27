export interface Point {
  x: number;
  y: number;
}
export interface Warning {
  color: string;
}
export interface Runway {
  id: string;
  centerX: number;
  centerY: number;
  direction: number;
  length: number;
  width: number;
  landingApproachAngle: number;
  departureAngle: number;
  landingPoint: Point;
  departurePoint: Point;
  landingApproachPoint: Point;
  angleTolerance: number;
}

export const PLANE_CONFIG = {
  SIZE: 40,
  SPEED: 0.4,
  CONFLICT_DISTANCE: 120,
  SCALE_DURATION_MS: 3000,
  TURN_SPEED: 0.1,
  PATH_ACCURACY: 10,
  INITIAL_DEPARTURE_SPEED: 0.5,
  DEPARTURE_PATH_LENGTH: 150,
  MIN_DEPARTURE_INTERVAL_MS: 2000,
  INITIAL_APPEAR_PATH_LENGTH: 200,
  LANDING_DURATION_MS: 4000, // New: Landing animation duration
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
  scaleDirection: 1 | -1 | 0;
  isOffscreen: boolean;
  warning: Warning | null;
  image: HTMLImageElement;
  ghostImage: HTMLImageElement;
  path: Point[] | null = null;
  pathIndex: number = 0;
  isDeparting: boolean = false;
  isLanding: boolean = false;
  isApproachingLanding: boolean = false; // New: For path drawn to landing area
  private targetLandingX: number | null = null;
  private targetLandingY: number | null = null;
  private landingProgress: number = 0;
  private landingStartTime: number = 0; // New: Track when landing animation starts
  private landingStartX: number = 0; // New: Starting position for landing
  private landingStartY: number = 0; // New: Starting position for landing
  private landingStartAngle: number = 0; // New: Starting angle for landing

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    image: HTMLImageElement,
    ghostImage: HTMLImageElement
  ) {
    this.id = Date.now() + Math.random();
    this.image = image;
    this.ghostImage = ghostImage;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.scale = 1;
    this.scaleDirection = 0;
    this.isOffscreen = false;
    this.warning = null;
    this.isApproachingLanding = false;
  }

  initSpawn(
    x: number,
    y: number,
    angle: number,
    path: Point[] | null,
    initialScale: number,
    scaleDirection: 1 | -1 | 0,
    isDeparting: boolean = false
  ): void {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.path = path;
    this.pathIndex = 0;
    this.scale = initialScale;
    this.scaleDirection = scaleDirection;
    this.isDeparting = isDeparting;
    this.isLanding = false;
    this.isApproachingLanding = false;
    this.isOffscreen = false;
    this.warning = null;
    this.targetLandingX = null;
    this.targetLandingY = null;
    this.landingProgress = 0;
    this.landingStartTime = 0;
  }

  // New: Set approaching landing state
  setApproachingLanding(approaching: boolean): void {
    this.isApproachingLanding = approaching;
  }

  update(deltaTime: number): void {
    const currentTime = performance.now();

    if (this.scaleDirection !== 0) {
      const scaleChange =
        (deltaTime / PLANE_CONFIG.SCALE_DURATION_MS) * this.scaleDirection;
      this.scale = Math.max(0, Math.min(1, this.scale + scaleChange));
      if (this.scale >= 1 && this.scaleDirection === 1) {
        this.scaleDirection = 0;
        this.isDeparting = false;
      }
      if (this.scale <= 0 && this.scaleDirection === -1) {
        this.scaleDirection = 0;
        this.isOffscreen = true;
        this.isLanding = false;
        this.isApproachingLanding = false;
        this.targetLandingX = null;
        this.targetLandingY = null;
        this.landingProgress = 0;
        this.landingStartTime = 0;
      }
    }

    // Enhanced landing animation with auto-correction (only when actually landing)
    if (
      this.isLanding &&
      this.targetLandingX !== null &&
      this.targetLandingY !== null
    ) {
      if (this.landingStartTime === 0) {
        this.landingStartTime = currentTime;
        this.landingStartX = this.x;
        this.landingStartY = this.y;
        this.landingStartAngle = this.angle;
      }

      const landingElapsed = currentTime - this.landingStartTime;
      const landingProgress = Math.min(
        landingElapsed / PLANE_CONFIG.LANDING_DURATION_MS,
        1
      );

      // Smooth interpolation to runway center with auto-correction
      this.x =
        this.landingStartX +
        (this.targetLandingX - this.landingStartX) * landingProgress;
      this.y =
        this.landingStartY +
        (this.targetLandingY - this.landingStartY) * landingProgress;

      // Auto-correct angle to align with runway direction
      const targetAngle = Math.atan2(
        this.targetLandingY - this.landingStartY,
        this.targetLandingX - this.landingStartX
      );
      this.angle = lerpAngle(
        this.landingStartAngle,
        targetAngle,
        landingProgress
      );

      return;
    }

    if (this.scale > 0 && !this.isLanding) {
      let targetAngle = this.angle;
      if (this.path && this.path.length > 0) {
        if (this.pathIndex < this.path.length) {
          const targetPoint = this.path[this.pathIndex];
          if (
            Math.sqrt(
              (targetPoint.x - this.x) ** 2 + (targetPoint.y - this.y) ** 2
            ) < PLANE_CONFIG.PATH_ACCURACY
          ) {
            this.pathIndex++;
          }
        } else {
          // Path completed - now check if we should start landing
          if (this.isApproachingLanding && !this.isLanding) {
            this.startLanding();
          }
          this.path = null;
        }
        if (this.path && this.pathIndex < this.path.length) {
          const currentTarget = this.path[this.pathIndex];
          targetAngle = Math.atan2(
            currentTarget.y - this.y,
            currentTarget.x - this.x
          );
        }
      }
      if (targetAngle !== this.angle) {
        this.angle = lerpAngle(
          this.angle,
          targetAngle,
          PLANE_CONFIG.TURN_SPEED
        );
      }
      let currentSpeed = PLANE_CONFIG.SPEED;
      if (this.isDeparting || (this.scale < 1 && this.scaleDirection === 1)) {
        currentSpeed =
          PLANE_CONFIG.INITIAL_DEPARTURE_SPEED +
          (PLANE_CONFIG.SPEED - PLANE_CONFIG.INITIAL_DEPARTURE_SPEED) *
            this.scale;
      }
      this.vx = Math.cos(this.angle) * currentSpeed;
      this.vy = Math.sin(this.angle) * currentSpeed;
      this.x += this.vx;
      this.y += this.vy;
      if (this.scaleDirection !== -1) {
        const m = PLANE_CONFIG.SIZE * 2;
        if (
          this.x < -m ||
          this.x > this.canvasWidth + m ||
          this.y < -m ||
          this.y > this.canvasHeight + m
        ) {
          this.isOffscreen = true;
        }
      }
    }
  }

  // New method to start the actual landing sequence
  startLanding(): void {
    if (this.targetLandingX !== null && this.targetLandingY !== null) {
      this.isLanding = true;
      this.scaleDirection = -1;
      this.landingStartTime = 0; // Will be set in update()
    }
  }

  setLandingTarget(targetX: number, targetY: number) {
    this.targetLandingX = targetX;
    this.targetLandingY = targetY;
    this.landingProgress = 0;
    this.landingStartTime = 0; // Reset landing animation
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.scale <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Draw warning circles BEFORE setting any opacity changes
    if (this.warning) {
      const opacity = 0.4 + Math.sin(Date.now() * 0.005) * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, PLANE_CONFIG.CONFLICT_DISTANCE / 2, 0, Math.PI * 2);
      ctx.fillStyle = `${this.warning.color}${Math.floor(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.fill();
    }

    // Enhanced opacity control for plane icon only
    if (this.isLanding) {
      // Blinking effect during actual landing animation
      if (Date.now() % 300 > 150) {
        ctx.globalAlpha = 0.4;
      }
    } else if (this.isApproachingLanding) {
      // 50% opacity when path is drawn to landing area (before actual landing)
      ctx.globalAlpha = 0.5;
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
    return (
      Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2) <
      PLANE_CONFIG.SIZE / 1.5
    );
  }
}
