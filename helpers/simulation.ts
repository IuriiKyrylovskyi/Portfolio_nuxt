import { Plane } from './plane';
import type {
  Point,
  PlaneOptions,
  WarningCircle,
} from '../interfaces/simulation';

// export class Simulation {
//   canvas: HTMLCanvasElement;
//   ctx: CanvasRenderingContext2D;
//   planes: Plane[] = [];
//   lastTime: number = 0;
//   animationFrameId: number | null = null;
//   warningCircles: { center: Point; radius: number; opacity: number }[] = [];

//   readonly maxPlanes = 7;
//   readonly minPlanes = 1;
//   readonly planeSize = 8;
//   readonly planeSpeed = 0.05; // Pixels per millisecond, adjust as needed
//   readonly conflictDistance = 50; // Distance for warning circle
//   readonly conflictRadius = 40; // Radius of the warning circle itself
//   readonly blinkingSpeed = 0.05; // Opacity change per frame for blinking
//   readonly opacityFadeSpeed = 0.02; // Opacity fade out speed

//   constructor(canvasId: string) {
//     this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
//     this.ctx = this.canvas.getContext('2d')!;

//     this.resizeCanvas();
//     window.addEventListener('resize', this.resizeCanvas.bind(this));
//     this.addPlane(); // Start with one plane

//     this.setupInputHandlers();
//   }

//   private resizeCanvas(): void {
//     this.canvas.width = window.innerWidth;
//     this.canvas.height = window.innerHeight;
//   }

//   private addPlane(): void {
//     if (this.planes.length >= this.maxPlanes) return;

//     const position: Point = {
//       x: Math.random() * this.canvas.width,
//       y: Math.random() * this.canvas.height,
//     };
//     const angle = Math.random() * 2 * Math.PI;
//     const velocity: Point = {
//       x: Math.cos(angle) * this.planeSpeed,
//       y: Math.sin(angle) * this.planeSpeed,
//     };

//     const options: PlaneOptions = {
//       position,
//       velocity,
//       size: this.planeSize,
//       color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
//     };
//     this.planes.push(new Plane(options));
//   }

//   private removePlane(): void {
//     if (this.planes.length > this.minPlanes) {
//       this.planes.pop(); // Remove the last one
//     }
//   }

//   private setupInputHandlers(): void {
//     let activePlane: Plane | null = null;
//     let dragStartPos: Point | null = null;

//     const getEventPos = (event: MouseEvent | TouchEvent): Point => {
//       if (event instanceof MouseEvent) {
//         return { x: event.clientX, y: event.clientY };
//       } else {
//         const touch = event.touches[0] || event.changedTouches[0];
//         return { x: touch.clientX, y: touch.clientY };
//       }
//     };

//     const findPlaneAtPos = (pos: Point): Plane | null => {
//       for (const plane of this.planes) {
//         const dist = Math.sqrt(
//           (plane.position.x - pos.x) ** 2 + (plane.position.y - pos.y) ** 2
//         );
//         if (dist < plane.size * 2) {
//           // Allow a larger click/touch area
//           return plane;
//         }
//       }
//       return null;
//     };

//     const onStart = (event: MouseEvent | TouchEvent) => {
//       event.preventDefault(); // Prevent scrolling on touch
//       const pos = getEventPos(event);
//       activePlane = findPlaneAtPos(pos);
//       if (activePlane) {
//         activePlane.isDragging = true;
//         dragStartPos = pos;
//       }
//     };

//     const onMove = (event: MouseEvent | TouchEvent) => {
//       if (activePlane && activePlane.isDragging && dragStartPos) {
//         const currentPos = getEventPos(event);
//         const dx = currentPos.x - activePlane.position.x;
//         const dy = currentPos.y - activePlane.position.y;
//         activePlane.targetDirection = Math.atan2(dy, dx);
//       }
//     };

//     const onEnd = () => {
//       if (activePlane) {
//         activePlane.isDragging = false;
//         activePlane.targetDirection = null;
//         activePlane = null;
//         dragStartPos = null;
//       }
//     };

//     this.canvas.addEventListener('mousedown', onStart);
//     this.canvas.addEventListener('mousemove', onMove);
//     this.canvas.addEventListener('mouseup', onEnd);
//     this.canvas.addEventListener('mouseleave', onEnd); // Important for mouse drag leaving canvas

//     this.canvas.addEventListener('touchstart', onStart, { passive: false });
//     this.canvas.addEventListener('touchmove', onMove, { passive: false });
//     this.canvas.addEventListener('touchend', onEnd);
//     this.canvas.addEventListener('touchcancel', onEnd);
//   }

//   private checkCollisions(deltaTime: number): void {
//     this.warningCircles = []; // Clear existing circles

//     for (let i = 0; i < this.planes.length; i++) {
//       for (let j = i + 1; j < this.planes.length; j++) {
//         const p1 = this.planes[i];
//         const p2 = this.planes[j];

//         const dist = Math.sqrt(
//           (p1.position.x - p2.position.x) ** 2 +
//             (p1.position.y - p2.position.y) ** 2
//         );

//         if (dist < this.conflictDistance) {
//           // Add/update warning circle
//           const center: Point = {
//             x: (p1.position.x + p2.position.x) / 2,
//             y: (p1.position.y + p2.position.y) / 2,
//           };

//           // Blinking effect for opacity
//           const opacity = Math.abs(
//             Math.sin(performance.now() * this.blinkingSpeed)
//           );

//           this.warningCircles.push({
//             center,
//             radius: this.conflictRadius,
//             opacity,
//           });
//         }
//       }
//     }
//     // Fade out logic for circles will be handled in the draw function for simplicity
//   }

//   start(): void {
//     this.lastTime = performance.now();
//     this.animate();
//   }

//   stop(): void {
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//       this.animationFrameId = null;
//     }
//   }

//   animate(): void {
//     const currentTime = performance.now();
//     const deltaTime = currentTime - this.lastTime;
//     this.lastTime = currentTime;

//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas

//     // Update planes
//     this.planes.forEach((plane) =>
//       plane.update(deltaTime, this.canvas.width, this.canvas.height)
//     );

//     // Check for collision warnings
//     this.checkCollisions(deltaTime);

//     // Draw everything
//     this.planes.forEach((plane) => plane.draw(this.ctx));
//     this.warningCircles.forEach((circle) => {
//       this.ctx.beginPath();
//       this.ctx.arc(
//         circle.center.x,
//         circle.center.y,
//         circle.radius,
//         0,
//         Math.PI * 2
//       );
//       this.ctx.strokeStyle = `rgba(255, 0, 0, ${circle.opacity})`;
//       this.ctx.lineWidth = 2;
//       this.ctx.stroke();
//     });

//     // Maintain 1-7 planes
//     if (Math.random() < 0.005 && this.planes.length < this.maxPlanes) {
//       // Small chance to add
//       this.addPlane();
//     }
//     if (Math.random() < 0.002 && this.planes.length > this.minPlanes) {
//       // Smaller chance to remove
//       this.removePlane();
//     }

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
//   }
// }

export class Simulation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private planes: Plane[] = [];
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private warningCircles: WarningCircle[] = [];

  // Configuration Constants
  readonly maxPlanes = 7;
  readonly minPlanes = 1;
  readonly planeBaseSize = 8; // Original size before scaling
  readonly planeSpeed = 0.00001; // Pixels per millisecond
  readonly conflictDistance = 60; // Distance between plane centers for warning
  readonly conflictRadius = 50; // Radius of the blinking warning circle
  readonly blinkingSpeed = 0.0001; // Speed of opacity/lightness change for blinking
  readonly hueCycleSpeed = 0.0002; // Speed of rainbow color cycle for warning circles

  // Configuration for the steering zone
  readonly steerZoneDistanceMultiplier = 2; // Mouse/touch must be this many times plane's base size ahead
  readonly steerZoneAngleDegrees = 30; // +/- degrees from plane's current direction
  readonly steerZoneAngleRadians: number;

  private activePlane: Plane | null = null; // Currently dragged plane

  // Bound event handlers to ensure `this` context is correct for removal
  private boundOnStart: (event: MouseEvent | TouchEvent) => void;
  private boundOnMove: (event: MouseEvent | TouchEvent) => void;
  private boundOnEnd: () => void;
  private boundResizeCanvas: () => void;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      console.error(`Canvas element with ID '${canvasId}' not found.`);
      return;
    }
    this.ctx = this.canvas.getContext('2d')!;

    this.steerZoneAngleRadians = (this.steerZoneAngleDegrees * Math.PI) / 180;

    // Bind event handlers once
    this.boundOnStart = this.onStart.bind(this);
    this.boundOnMove = this.onMove.bind(this);
    this.boundOnEnd = this.onEnd.bind(this);
    this.boundResizeCanvas = this.resizeCanvas.bind(this);

    this.resizeCanvas();
    window.addEventListener('resize', this.boundResizeCanvas);
    this.addPlane(); // Start with one plane

    this.setupInputHandlers();
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Adds a new plane to the simulation with an entrance animation
  private addPlane(): void {
    // Only add if we're below max and no other planes are currently fading in or out
    const activePlanes = this.planes.filter(
      (p) => !p.isRemoving && p.currentScale > 0
    );
    if (activePlanes.length >= this.maxPlanes) return;

    const position: Point = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
    };
    const angle = Math.random() * 2 * Math.PI;
    const velocity: Point = {
      x: Math.cos(angle) * this.planeSpeed,
      y: Math.sin(angle) * this.planeSpeed,
    };

    const options: PlaneOptions = {
      position,
      velocity,
      size: this.planeBaseSize, // Use baseSize
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      initialScale: 0, // Start at scale 0 for animation
    };
    this.planes.push(new Plane(options));
  }

  // Initiates the removal animation for a plane
  private initiatePlaneRemoval(): void {
    const planesNotRemoving = this.planes.filter((p) => !p.isRemoving);
    if (planesNotRemoving.length > this.minPlanes) {
      // Pick a random plane that is not already removing
      const planeToRemove =
        planesNotRemoving[Math.floor(Math.random() * planesNotRemoving.length)];
      if (planeToRemove) {
        planeToRemove.isRemoving = true;
      }
    }
  }

  // --- Input Handlers ---
  private getEventPos(event: MouseEvent | TouchEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  }

  private findPlaneAtPos(pos: Point): Plane | null {
    for (const plane of this.planes) {
      // Don't interact with planes that are removing
      if (plane.isRemoving) continue;

      // Check against current scaled size
      const dist = Math.sqrt(
        (plane.position.x - pos.x) ** 2 + (plane.position.y - pos.y) ** 2
      );
      if (dist < plane.size * 2) {
        // Allow a larger click/touch area
        return plane;
      }
    }
    return null;
  }

  private onStart(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    const pos = this.getEventPos(event);
    this.activePlane = this.findPlaneAtPos(pos);
    if (this.activePlane) {
      this.activePlane.isDragging = true;
    }
  }

  private onMove(event: MouseEvent | TouchEvent): void {
    if (this.activePlane && this.activePlane.isDragging) {
      const currentPos = this.getEventPos(event);

      const planeCenter = this.activePlane.position;
      const planeDirection = this.activePlane.direction;
      const planeBaseSize = this.activePlane.baseSize; // Use baseSize for steering zone calculation

      const dxToMouse = currentPos.x - planeCenter.x;
      const dyToMouse = currentPos.y - planeCenter.y;
      const distToMouse = Math.sqrt(dxToMouse ** 2 + dyToMouse ** 2);
      const angleToMouse = Math.atan2(dyToMouse, dxToMouse);

      const requiredSteerDistance =
        planeBaseSize * this.steerZoneDistanceMultiplier;

      if (distToMouse < requiredSteerDistance) {
        return; // Not far enough ahead
      }

      let angleDiff = angleToMouse - planeDirection;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      if (Math.abs(angleDiff) <= this.steerZoneAngleRadians) {
        this.activePlane.setDirection(angleToMouse);
      }
    }
  }

  private onEnd(): void {
    if (this.activePlane) {
      this.activePlane.isDragging = false;
      this.activePlane = null;
    }
  }

  private setupInputHandlers(): void {
    this.canvas.addEventListener('mousedown', this.boundOnStart);
    this.canvas.addEventListener('mousemove', this.boundOnMove);
    this.canvas.addEventListener('mouseup', this.boundOnEnd);
    this.canvas.addEventListener('mouseleave', this.boundOnEnd);

    this.canvas.addEventListener('touchstart', this.boundOnStart, {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', this.boundOnMove, {
      passive: false,
    });
    this.canvas.addEventListener('touchend', this.boundOnEnd);
    this.canvas.addEventListener('touchcancel', this.boundOnEnd);
  }

  private removeInputHandlers(): void {
    this.canvas.removeEventListener('mousedown', this.boundOnStart);
    this.canvas.removeEventListener('mousemove', this.boundOnMove);
    this.canvas.removeEventListener('mouseup', this.boundOnEnd);
    this.canvas.removeEventListener('mouseleave', this.boundOnEnd);

    this.canvas.removeEventListener('touchstart', this.boundOnStart);
    this.canvas.removeEventListener('touchmove', this.boundOnMove);
    this.canvas.removeEventListener('touchend', this.boundOnEnd);
    this.canvas.removeEventListener('touchcancel', this.boundOnEnd);
  }

  // --- Collision Detection ---
  private checkCollisions(): void {
    this.warningCircles = [];

    for (let i = 0; i < this.planes.length; i++) {
      // Don't check collisions for planes that are removing or not fully scaled in
      if (this.planes[i].isRemoving || this.planes[i].currentScale < 1)
        continue;

      for (let j = i + 1; j < this.planes.length; j++) {
        // Don't check collisions for planes that are removing or not fully scaled in
        if (this.planes[j].isRemoving || this.planes[j].currentScale < 1)
          continue;

        const p1 = this.planes[i];
        const p2 = this.planes[j];

        const dist = Math.sqrt(
          (p1.position.x - p2.position.x) ** 2 +
            (p1.position.y - p2.position.y) ** 2
        );

        if (dist < this.conflictDistance) {
          const center: Point = {
            x: (p1.position.x + p2.position.x) / 2,
            y: (p1.position.y + p2.position.y) / 2,
          };

          const time = performance.now();
          // Rainbow Blinking Color: Hue cycles, Lightness blinks
          const hue = (time * this.hueCycleSpeed) % 360;
          const lightness = 30 + 20 * Math.sin(time * this.blinkingSpeed); // Lightness oscillates between 10% and 50%

          this.warningCircles.push({
            center,
            radius: this.conflictRadius,
            opacity: 1, // Full opacity, lightness provides the blink
            hue: hue,
            lightness: lightness, // Store lightness too
          } as WarningCircle); // Type assertion for custom lightness
        }
      }
    }
  }

  start(): void {
    this.lastTime = performance.now();
    this.animate();
  }

  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.boundResizeCanvas);
    this.removeInputHandlers();
  }

  animate(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and filter planes (remove completely faded-out ones)
    this.planes = this.planes.filter((plane) => {
      plane.update(deltaTime, this.canvas.width, this.canvas.height);
      // Keep plane if it's not removing OR it's removing but still visible
      return !plane.isRemoving || plane.currentScale > 0;
    });

    this.checkCollisions();

    // Draw Planes
    this.planes.forEach((plane) => {
      // Use baseSize for padding check, as currentScale affects drawing size
      const padding = plane.baseSize * 2;
      if (
        plane.position.x + padding > 0 &&
        plane.position.x - padding < this.canvas.width &&
        plane.position.y + padding > 0 &&
        plane.position.y - padding < this.canvas.height
      ) {
        plane.draw(this.ctx);
      }
    });

    // Draw Warning Circles
    this.warningCircles.forEach((circle) => {
      this.ctx.beginPath();
      this.ctx.arc(
        circle.center.x,
        circle.center.y,
        circle.radius,
        0,
        Math.PI * 2
      );
      // Use HSL for dynamic color and blinking lightness
      // `circle.lightness` will now control the blink, `circle.hue` the color cycle
      this.ctx.strokeStyle = `hsla(${circle.hue}, 100%, ${circle.lightness}%, ${circle.opacity})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });

    // Dynamically add/remove planes
    const activePlanesCount = this.planes.filter(
      (p) => !p.isRemoving && p.currentScale >= 1
    ).length;

    if (Math.random() < 0.003 && activePlanesCount < this.maxPlanes) {
      this.addPlane();
    }
    if (Math.random() < 0.001 && activePlanesCount > this.minPlanes) {
      this.initiatePlaneRemoval();
    }

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }
}
