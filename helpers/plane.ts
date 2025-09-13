import type { PlaneOptions, Point } from '~/interfaces/simulation';

// export class Plane {
//   position: Point;
//   velocity: Point;
//   direction: number; // Angle in radians
//   size: number;
//   color: string;
//   isDragging: boolean = false;
//   targetDirection: number | null = null; // For smooth turning

//   constructor(options: PlaneOptions) {
//     this.position = { ...options.position };
//     this.velocity = { ...options.velocity };
//     this.size = options.size;
//     this.color = options.color;
//     this.direction = Math.atan2(this.velocity.y, this.velocity.x); // Initial direction from velocity
//   }

//   // Update direction based on velocity
//   private updateDirection(): void {
//     this.direction = Math.atan2(this.velocity.y, this.velocity.x);
//   }

//   // Move the plane
//   update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
//     if (this.isDragging && this.targetDirection !== null) {
//       // Smoothly turn towards target direction
//       const turnSpeed = 0.1; // Adjust for faster/slower turns
//       let angleDiff = this.targetDirection - this.direction;

//       // Normalize angle difference to be within -PI to PI
//       if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
//       if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

//       this.direction += angleDiff * turnSpeed;

//       // Update velocity to reflect new direction
//       const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
//       this.velocity.x = Math.cos(this.direction) * speed;
//       this.velocity.y = Math.sin(this.direction) * speed;
//     }

//     this.position.x += this.velocity.x * deltaTime;
//     this.position.y += this.velocity.y * deltaTime;

//     // Boundary collision (bounce off walls)
//     if (this.position.x < 0 || this.position.x > canvasWidth) {
//       this.velocity.x *= -1;
//       this.position.x = Math.max(0, Math.min(canvasWidth, this.position.x)); // Snap to edge
//       this.updateDirection();
//     }
//     if (this.position.y < 0 || this.position.y > canvasHeight) {
//       this.velocity.y *= -1;
//       this.position.y = Math.max(0, Math.min(canvasHeight, this.position.y)); // Snap to edge
//       this.updateDirection();
//     }
//   }

//   // Draw the plane (simple triangle for now)
//   draw(ctx: CanvasRenderingContext2D): void {
//     ctx.save();
//     ctx.translate(this.position.x, this.position.y);
//     ctx.rotate(this.direction);

//     ctx.fillStyle = this.color;
//     ctx.beginPath();
//     ctx.moveTo(this.size, 0); // Nose
//     ctx.lineTo(-this.size, -this.size / 2); // Left wing
//     ctx.lineTo(-this.size, this.size / 2); // Right wing
//     ctx.closePath();
//     ctx.fill();

//     ctx.restore();
//   }
// }

export class Plane {
  position: Point;
  velocity: Point;
  direction: number; // Angle in radians
  baseSize: number; // Original size
  currentScale: number; // Current scale for animation (0 to 1)
  color: string;
  isDragging: boolean = false;
  speed: number;

  isRemoving: boolean = false; // True when plane is fading out
  removeTimer: number = 0; // Timer for fade-out duration
  readonly animationDuration = 1000; // 1 second for scale animation (in/out)

  constructor(options: PlaneOptions) {
    this.position = { ...options.position };
    this.velocity = { ...options.velocity };
    this.baseSize = options.size; // Store original size
    this.currentScale = options.initialScale ?? 1; // Start with initialScale if provided, else 1
    this.color = options.color;
    this.speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    this.direction = Math.atan2(this.velocity.y, this.velocity.x);
  }

  // Current drawing size, considering the animation scale
  get size(): number {
    return this.baseSize * this.currentScale;
  }

  private updateVelocityFromDirection(): void {
    this.velocity.x = Math.cos(this.direction) * this.speed;
    this.velocity.y = Math.sin(this.direction) * this.speed;
  }

  setDirection(newDirection: number): void {
    this.direction = newDirection;
    this.updateVelocityFromDirection();
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    // Handle entrance animation (scaling up)
    if (this.currentScale < 1 && !this.isRemoving) {
      this.currentScale += deltaTime / this.animationDuration;
      if (this.currentScale > 1) this.currentScale = 1; // Cap at 1
    }

    // Handle exit animation (scaling down)
    if (this.isRemoving) {
      this.removeTimer += deltaTime;
      this.currentScale = 1 - this.removeTimer / this.animationDuration;
      if (this.currentScale < 0) this.currentScale = 0; // Cap at 0
    }

    // Only update position if not fully removed
    if (this.currentScale > 0) {
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;

      let bounced = false;
      // Note: Use `this.size` (which is `this.baseSize * this.currentScale`) for boundary checks
      if (this.position.x < 0) {
        this.position.x = 0;
        this.velocity.x *= -1;
        bounced = true;
      } else if (this.position.x > canvasWidth) {
        this.position.x = canvasWidth;
        this.velocity.x *= -1;
        bounced = true;
      }
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y *= -1;
        bounced = true;
      } else if (this.position.y > canvasHeight) {
        this.position.y = canvasHeight;
        this.velocity.y *= -1;
        bounced = true;
      }

      if (bounced) {
        this.direction = Math.atan2(this.velocity.y, this.velocity.x);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Only draw if visible
    if (this.currentScale <= 0) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.direction);

    // Apply scaling transform based on currentScale
    ctx.scale(this.currentScale, this.currentScale);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.baseSize, 0);
    ctx.lineTo(-this.baseSize, -this.baseSize / 2);
    ctx.lineTo(-this.baseSize, this.baseSize / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
