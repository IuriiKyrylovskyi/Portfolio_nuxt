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
  direction: number; // The primary angle of traffic flow (e.g., 0 for East, PI/2 for South)
  length: number;
  width: number;

  // Derived properties
  landingApproachAngle: number; // The angle a plane needs to have to land
  departureAngle: number; // The angle a plane departs at

  landingPoint: Point; // Point on the runway where plane disappears (at the end)
  departurePoint: Point; // Point on the runway where plane appears (at the other end)

  landingApproachPoint: Point; // Point where plane starts scaling down (one plane length before runway edge)

  angleTolerance: number;
}

export const PLANE_CONFIG = {
  SIZE: 40,
  SPEED: 0.4,
  CONFLICT_DISTANCE: 120,
  SCALE_DURATION_MS: 3000,
  TURN_SPEED: 0.1, // Controls how quickly the plane turns towards its target angle
  PATH_ACCURACY: 10,
  INITIAL_DEPARTURE_SPEED: 0.5,
  DEPARTURE_PATH_LENGTH: 150,
  MIN_DEPARTURE_INTERVAL_MS: 2000,
  INITIAL_APPEAR_PATH_LENGTH: 200, // How far onto screen for initial random spawn path
};

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  return a + diff * t;
}

function getAngleDifference(angle1: number, angle2: number): number {
  let diff = angle2 - angle1;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return Math.abs(diff);
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
  path: Point[] | null = null;
  pathIndex: number = 0;

  isDeparting: boolean = false;
  isLanding: boolean = false;

  private targetLandingX: number | null = null;
  private targetLandingY: number | null = null;
  private landingProgress: number = 0;

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

  // --- MODIFIED: General Plane Spawn (replaces resetRandomEdgeSpawn) ---
  // Now takes initial position, angle, and path, and can start scaled down
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
    this.isOffscreen = false;
    this.warning = null;
    this.targetLandingX = null;
    this.targetLandingY = null;
    this.landingProgress = 0;
  }

  // --- MODIFIED UPDATE: Smoothed Turns and Landing Interpolation ---
  update(deltaTime: number): void {
    // Handle scaling animation
    if (this.scaleDirection !== 0) {
      const scaleChange =
        (deltaTime / PLANE_CONFIG.SCALE_DURATION_MS) * this.scaleDirection;
      this.scale = Math.max(0, Math.min(1, this.scale + scaleChange));

      if (this.scale >= 1 && this.scaleDirection === 1) {
        // Done growing
        this.scaleDirection = 0;
        this.isDeparting = false;
      }
      if (this.scale <= 0 && this.scaleDirection === -1) {
        // Done shrinking
        this.scaleDirection = 0;
        this.isOffscreen = true;
        this.isLanding = false;
        this.targetLandingX = null;
        this.targetLandingY = null;
        this.landingProgress = 0;
      }
    }

    // Handle smooth landing movement separately if landing
    if (
      this.isLanding &&
      this.targetLandingX !== null &&
      this.targetLandingY !== null
    ) {
      this.landingProgress += deltaTime / PLANE_CONFIG.SCALE_DURATION_MS;
      this.landingProgress = Math.min(1, this.landingProgress);

      const progressRatio = deltaTime / PLANE_CONFIG.SCALE_DURATION_MS;
      this.x = this.x + (this.targetLandingX - this.x) * progressRatio;
      this.y = this.y + (this.targetLandingY - this.y) * progressRatio;

      return; // Skip normal movement if landing
    }

    // Only move the plane if it's visible (not fully shrunk) AND not actively landing
    if (this.scale > 0 && !this.isLanding) {
      let targetAngle = this.angle; // Default to current angle (no turn)

      // Path Following Logic
      if (this.path && this.path.length > 0) {
        // Check if path exists and has elements
        const targetPoint = this.path[this.pathIndex]; // This line assumes pathIndex is valid

        // --- FIX: Check pathIndex validity BEFORE accessing targetPoint ---
        if (this.pathIndex < this.path.length) {
          const distance = Math.sqrt(
            (targetPoint.x - this.x) ** 2 + (targetPoint.y - this.y) ** 2
          );

          if (distance < PLANE_CONFIG.PATH_ACCURACY) {
            this.pathIndex++;
            // If we just advanced beyond the path, set path to null
            if (this.pathIndex >= this.path.length) {
              this.path = null;
            }
          }
        } else {
          // If pathIndex somehow got out of bounds without clearing path
          this.path = null;
        }

        // --- REVISED: Get currentTarget after potentially updating pathIndex and clearing path ---
        if (this.path && this.pathIndex < this.path.length) {
          // Only access if path is still valid
          const currentTarget = this.path[this.pathIndex];
          targetAngle = Math.atan2(
            currentTarget.y - this.y,
            currentTarget.x - this.x
          );
        } else {
          this.path = null; // Ensure path is null if pathIndex is out of bounds or path cleared
        }
      }

      // SMOOTH TURN: Always apply lerpAngle if there's a targetAngle different from current
      if (targetAngle !== this.angle) {
        this.angle = lerpAngle(
          this.angle,
          targetAngle,
          PLANE_CONFIG.TURN_SPEED
        );
      }

      let currentSpeed = PLANE_CONFIG.SPEED;
      if (this.isDeparting && this.scale < 1) {
        currentSpeed =
          PLANE_CONFIG.INITIAL_DEPARTURE_SPEED +
          (PLANE_CONFIG.SPEED - PLANE_CONFIG.INITIAL_DEPARTURE_SPEED) *
            this.scale;
      } else if (this.scale < 1 && this.scaleDirection === 1) {
        currentSpeed =
          PLANE_CONFIG.INITIAL_DEPARTURE_SPEED +
          (PLANE_CONFIG.SPEED - PLANE_CONFIG.INITIAL_DEPARTURE_SPEED) *
            this.scale;
      }

      this.vx = Math.cos(this.angle) * currentSpeed;
      this.vy = Math.sin(this.angle) * currentSpeed;
      this.x += this.vx;
      this.y += this.vy;

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

  setLandingTarget(targetX: number, targetY: number) {
    this.targetLandingX = targetX;
    this.targetLandingY = targetY;
    this.landingProgress = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
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
    const distance = Math.sqrt(
      (point.x - this.x) ** 2 + (point.y - this.y) ** 2
    );
    return distance < PLANE_CONFIG.SIZE / 1.5;
  }
}

//// -----------------
//// -----------------
//// -----------------
//// -----------------
// types/traffic.ts

// // ... (other interfaces, constants, functions remain the same) ...

// export class Plane {
//   // ... (properties remain the same) ...

//   constructor(
//     private canvasWidth: number,
//     private canvasHeight: number,
//     image: HTMLImageElement,
//     initialScale: number = 1,
//     initialScaleDirection: 1 | -1 | 0 = 0
//   ) {
//     // ... (constructor body remains the same) ...
//   }

//   initSpawn(
//     x: number,
//     y: number,
//     angle: number,
//     path: Point[] | null,
//     initialScale: number,
//     scaleDirection: 1 | -1 | 0,
//     isDeparting: boolean = false
//   ): void {
//     // ... (initSpawn body remains the same) ...
//   }

//   // --- MODIFIED UPDATE: Smoothed Turns and Landing Interpolation with path safety check ---
//   update(deltaTime: number): void {
//     // Handle scaling animation
//     if (this.scaleDirection !== 0) {
//       const scaleChange =
//         (deltaTime / PLANE_CONFIG.SCALE_DURATION_MS) * this.scaleDirection;
//       this.scale = Math.max(0, Math.min(1, this.scale + scaleChange));

//       if (this.scale >= 1 && this.scaleDirection === 1) {
//         // Done growing
//         this.scaleDirection = 0;
//         this.isDeparting = false;
//       }
//       if (this.scale <= 0 && this.scaleDirection === -1) {
//         // Done shrinking
//         this.scaleDirection = 0;
//         this.isOffscreen = true;
//         this.isLanding = false;
//         this.targetLandingX = null;
//         this.targetLandingY = null;
//         this.landingProgress = 0;
//       }
//     }

//     // Handle smooth landing movement separately if landing
//     if (
//       this.isLanding &&
//       this.targetLandingX !== null &&
//       this.targetLandingY !== null
//     ) {
//       this.landingProgress += deltaTime / PLANE_CONFIG.SCALE_DURATION_MS;
//       this.landingProgress = Math.min(1, this.landingProgress);

//       const progressRatio = deltaTime / PLANE_CONFIG.SCALE_DURATION_MS;
//       this.x = this.x + (this.targetLandingX - this.x) * progressRatio;
//       this.y = this.y + (this.targetLandingY - this.y) * progressRatio;

//       return; // Skip normal movement if landing
//     }

//     // Only move the plane if it's visible (not fully shrunk) AND not actively landing
//     if (this.scale > 0 && !this.isLanding) {
//       let targetAngle = this.angle; // Default to current angle (no turn)

//       // Path Following Logic
//       if (this.path && this.path.length > 0) {
//         // Check if path exists and has elements
//         const targetPoint = this.path[this.pathIndex]; // This line assumes pathIndex is valid

//         // --- FIX: Check pathIndex validity BEFORE accessing targetPoint ---
//         if (this.pathIndex < this.path.length) {
//           const distance = Math.sqrt(
//             (targetPoint.x - this.x) ** 2 + (targetPoint.y - this.y) ** 2
//           );

//           if (distance < PLANE_CONFIG.PATH_ACCURACY) {
//             this.pathIndex++;
//             // If we just advanced beyond the path, set path to null
//             if (this.pathIndex >= this.path.length) {
//               this.path = null;
//             }
//           }
//         } else {
//           // If pathIndex somehow got out of bounds without clearing path
//           this.path = null;
//         }

//         // --- REVISED: Get currentTarget after potentially updating pathIndex and clearing path ---
//         if (this.path && this.pathIndex < this.path.length) {
//           // Only access if path is still valid
//           const currentTarget = this.path[this.pathIndex];
//           targetAngle = Math.atan2(
//             currentTarget.y - this.y,
//             currentTarget.x - this.x
//           );
//         } else {
//           this.path = null; // Ensure path is null if pathIndex is out of bounds or path cleared
//         }
//       }

//       // SMOOTH TURN: Always apply lerpAngle if there's a targetAngle different from current
//       if (targetAngle !== this.angle) {
//         this.angle = lerpAngle(
//           this.angle,
//           targetAngle,
//           PLANE_CONFIG.TURN_SPEED
//         );
//       }

//       let currentSpeed = PLANE_CONFIG.SPEED;
//       if (this.isDeparting && this.scale < 1) {
//         currentSpeed =
//           PLANE_CONFIG.INITIAL_DEPARTURE_SPEED +
//           (PLANE_CONFIG.SPEED - PLANE_CONFIG.INITIAL_DEPARTURE_SPEED) *
//             this.scale;
//       } else if (this.scale < 1 && this.scaleDirection === 1) {
//         currentSpeed =
//           PLANE_CONFIG.INITIAL_DEPARTURE_SPEED +
//           (PLANE_CONFIG.SPEED - PLANE_CONFIG.INITIAL_DEPARTURE_SPEED) *
//             this.scale;
//       }

//       this.vx = Math.cos(this.angle) * currentSpeed;
//       this.vy = Math.sin(this.angle) * currentSpeed;
//       this.x += this.vx;
//       this.y += this.vy;

//       // Check if offscreen (only if not shrinking via landing)
//       if (this.scaleDirection !== -1) {
//         const offscreenMargin = PLANE_CONFIG.SIZE * 2;
//         if (
//           this.x < -offscreenMargin ||
//           this.x > this.canvasWidth + offscreenMargin ||
//           this.y < -offscreenMargin ||
//           this.y > this.canvasHeight + offscreenMargin
//         ) {
//           this.isOffscreen = true;
//         }
//       }
//     }
//   }

//   // ... (draw and isPointOnIcon methods remain the same) ...
// }
