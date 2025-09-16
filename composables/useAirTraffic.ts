import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  Plane,
  PLANE_CONFIG,
  lerpAngle,
  type Point,
  type Strip,
} from '~/interfaces/traffic';

const MAX_PLANES = 7;
const MIN_PLANES = 1;
const PATH_RAW_SIMPLIFY_THRESHOLD = 20; // How far to drag before a raw point is added
const PATH_NORMALIZED_STEP = 10; //2; // The final distance between dots in the path

// List of available plane icons from the /public directory
const planeIconUrls = [
  '/planes/1.png',
  '/planes/2.png',
  '/planes/3.png',
  '/planes/4.png',
  '/planes/5.png',
  '/planes/6.png',
  '/planes/7.png',
];

// /**
//  * Processes a raw path of points and converts it into a new path where
//  * all points are a fixed distance apart. This is the key to smooth movement
//  * and uniform dot rendering.
//  * @param path The raw path from user input.
//  * @param step The desired distance between points.
//  * @returns A new, evenly-spaced path.
//  */
// function normalizePathByDistance(path: Point[], step: number): Point[] {
//   if (path.length < 2) return path;
//   const newPath: Point[] = [path[0]];
//   let remainingDist = 0;
//   for (let i = 0; i < path.length - 1; i++) {
//     const start = path[i];
//     const end = path[i + 1];
//     const segmentDx = end.x - start.x;
//     const segmentDy = end.y - start.y;
//     const segmentLen = Math.sqrt(segmentDx ** 2 + segmentDy ** 2);
//     if (segmentLen === 0) continue;
//     const segmentDirX = segmentDx / segmentLen;
//     const segmentDirY = segmentDy / segmentLen;
//     let currentDist = step - remainingDist;
//     while (currentDist < segmentLen) {
//       newPath.push({
//         x: start.x + segmentDirX * currentDist,
//         y: start.y + segmentDirY * currentDist,
//       });
//       currentDist += step;
//     }
//     remainingDist = segmentLen - (currentDist - step);
//   }
//   return newPath;
// }

// function findClosestPointIndex(position: Point, path: Point[]): number {
//   if (!path || path.length === 0) return 0;
//   let closestIndex = 0;
//   let minDistance = Infinity;

//   for (let i = 0; i < path.length; i++) {
//     const dx = position.x - path[i].x;
//     const dy = position.y - path[i].y;
//     const distance = dx * dx + dy * dy; // Use squared distance for efficiency
//     if (distance < minDistance) {
//       minDistance = distance;
//       closestIndex = i;
//     }
//   }
//   return closestIndex;
// }

// export function useAirTraffic(canvasRef: Ref<HTMLCanvasElement | null>) {
//   const planes = ref<Plane[]>([]);
//   const draggedPlane = ref<Plane | null>(null);
//   const rawDragPath = ref<Point[] | null>(null); // We now store the raw path separately

//   let ctx: CanvasRenderingContext2D | null = null;
//   let animationFrameId: number;
//   const loadedPlaneImages: HTMLImageElement[] = [];

//   const JANJO_WAYPOINT = {
//     name: 'JANJO',
//     x: 0, // Will be set in setup() to be on the right border
//     y: 0, // Will be set in setup() to be roughly center-right
//   };

//   const getDistance = (p1: Point, p2: Point) =>
//     Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
//   const addPlane = () => {
//     if (
//       planes.value.length < MAX_PLANES &&
//       canvasRef.value &&
//       loadedPlaneImages.length > 0
//     ) {
//       const randomImage =
//         loadedPlaneImages[Math.floor(Math.random() * loadedPlaneImages.length)];
//       planes.value.push(
//         new Plane(canvasRef.value.width, canvasRef.value.height, randomImage)
//       );
//     }
//   };
//   const checkConflicts = () => {
//     planes.value.forEach((p) => (p.warning = null));
//     for (let i = 0; i < planes.value.length; i++) {
//       for (let j = i + 1; j < planes.value.length; j++) {
//         const p1 = planes.value[i];
//         const p2 = planes.value[j];
//         if (getDistance(p1, p2) < PLANE_CONFIG.CONFLICT_DISTANCE) {
//           if (!p1.warning) p1.warning = { color: `#ff8f00` };
//           p2.warning = p1.warning;
//         }
//       }
//     }
//   };

//   const drawWaypoint = (waypoint: typeof JANJO_WAYPOINT) => {
//     if (!ctx) return;

//     ctx.save();
//     ctx.translate(waypoint.x, waypoint.y);

//     // Draw the name
//     ctx.font = 'bold 16px Arial';
//     ctx.fillStyle = 'white';
//     ctx.textAlign = 'right'; // Align text to the right of the icon
//     ctx.textBaseline = 'middle';
//     ctx.fillText(waypoint.name, 24, -26); // Offset to the left of the icon

//     // Draw label 'track to Europe'
//     ctx.font = '14px italian Arial'; // You can choose a different font style
//     ctx.fillStyle = '#9e9e9e'; // Choose a color
//     ctx.textAlign = 'right'; // Align the new text to the left
//     ctx.textBaseline = 'middle';
//     ctx.fillText('traffic queue to Europe ➜', -20, 2);

//     // Draw the circular icon (like the image provided)
//     ctx.beginPath();
//     ctx.arc(0, 0, 8, 0, Math.PI * 2); // Outer circle
//     ctx.arc(0, 0, 4, 0, Math.PI * 2); // Inner circle
//     ctx.strokeStyle = 'white';
//     ctx.lineWidth = 1.5;
//     ctx.stroke();

//     // Draw the crosshairs inside the circle
//     ctx.beginPath();
//     ctx.moveTo(-7, 0);
//     ctx.lineTo(7, 0); // Horizontal line
//     ctx.moveTo(0, -7);
//     ctx.lineTo(0, 7); // Vertical line
//     ctx.stroke();

//     // Draw the white line to the right side ---
//     // Define the angle and length
//     const angleInDegrees = -12;
//     const angleInRadians = angleInDegrees * (Math.PI / 180);
//     const startX = 8; // Starting point just outside the circle
//     const lineLength = 20; // Length of the line

//     // Calculate the end coordinates using trigonometry
//     const endX = startX + lineLength * Math.cos(angleInRadians);
//     const endY = 0 + lineLength * Math.sin(angleInRadians);

//     ctx.beginPath();
//     ctx.strokeStyle = 'white';
//     ctx.lineWidth = 3;
//     ctx.moveTo(startX, -1);
//     ctx.lineTo(endX, endY);
//     ctx.stroke();

//     ctx.restore();
//   };

//   let lastTime = 0;
//   const animate = (timestamp: number) => {
//     if (!ctx || !canvasRef.value) return;
//     const deltaTime = timestamp - lastTime;
//     lastTime = timestamp;

//     ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

//     // --- UPDATED DRAWING LOGIC: DOTS ONLY ---
//     ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

//     drawWaypoint(JANJO_WAYPOINT);
//     // Draw all assigned flight paths as faint dots
//     planes.value.forEach((plane) => {
//       if (plane.path) {
//         for (let i = plane.pathIndex; i < plane.path.length; i++) {
//           const point = plane.path[i];
//           ctx.beginPath();
//           ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
//           ctx.fill();
//         }
//       }
//     });

//     if (
//       planes.value.length < MIN_PLANES ||
//       (planes.value.length < MAX_PLANES && Math.random() < 0.005)
//     )
//       addPlane();
//     planes.value = planes.value.filter((p) => !p.isOffscreen);
//     checkConflicts();
//     planes.value.forEach((plane) => {
//       plane.update(deltaTime);
//       plane.draw(ctx!);
//     });
//     animationFrameId = requestAnimationFrame(animate);
//   };

//   const getEventPoint = (e: MouseEvent | TouchEvent): Point => {
//     const rect = canvasRef.value!.getBoundingClientRect();
//     const pos = 'touches' in e ? e.touches[0] : e;
//     return { x: pos.clientX - rect.left, y: pos.clientY - rect.top };
//   };

//   const handleStart = (e: MouseEvent | TouchEvent) => {
//     e.preventDefault();
//     const point = getEventPoint(e);
//     for (let i = planes.value.length - 1; i >= 0; i--) {
//       const plane = planes.value[i];
//       if (plane.isPointOnIcon(point)) {
//         draggedPlane.value = plane;
//         // Start collecting the raw path from the plane's position
//         rawDragPath.value = [{ x: plane.x, y: plane.y }];
//         // Clear any previous path immediately
//         plane.path = null;
//         break;
//       }
//     }
//   };

//   const handleMove = (e: MouseEvent | TouchEvent) => {
//     if (!draggedPlane.value || !rawDragPath.value) return;
//     e.preventDefault();
//     const point = getEventPoint(e);
//     const lastPoint = rawDragPath.value[rawDragPath.value.length - 1];

//     if (getDistance(point, lastPoint) > PATH_RAW_SIMPLIFY_THRESHOLD) {
//       rawDragPath.value.push(point);

//       const normalizedPath = normalizePathByDistance(
//         rawDragPath.value,
//         PATH_NORMALIZED_STEP
//       );

//       // --- THIS IS THE NEW LOGIC ---
//       // 1. Find the index on the new path closest to the plane's CURRENT position.
//       const closestIndex = findClosestPointIndex(
//         { x: draggedPlane.value.x, y: draggedPlane.value.y },
//         normalizedPath
//       );

//       // 2. Assign the full new path to the plane.
//       draggedPlane.value.path = normalizedPath;
//       // 3. Tell the plane to start following from that closest point, not from the beginning.
//       draggedPlane.value.pathIndex = closestIndex;
//     }
//   };

//   const handleEnd = () => {
//     draggedPlane.value = null;
//     rawDragPath.value = null;
//   };

//   const setup = () => {
//     if (!canvasRef.value) return;
//     ctx = canvasRef.value.getContext('2d');
//     canvasRef.value.width = window.innerWidth;
//     canvasRef.value.height = window.innerHeight;

//     JANJO_WAYPOINT.x = canvasRef.value.width - 30; // 60 pixels from the right border
//     JANJO_WAYPOINT.y = 150; // Vertically centered

//     planes.value = [];
//     addPlane();
//   };
//   onMounted(() => {
//     const imagePromises = planeIconUrls.map(
//       (url) =>
//         new Promise<HTMLImageElement>((resolve, reject) => {
//           const img = new Image();
//           img.src = url;
//           img.onload = () => resolve(img);
//           img.onerror = () => reject(`Failed to load image at ${url}`);
//         })
//     );
//     Promise.all(imagePromises)
//       .then((images) => {
//         loadedPlaneImages.push(...images);
//         setup();
//         canvasRef.value?.addEventListener('mousedown', handleStart);
//         canvasRef.value?.addEventListener('mousemove', handleMove);
//         window.addEventListener('mouseup', handleEnd);
//         canvasRef.value?.addEventListener('touchstart', handleStart, {
//           passive: false,
//         });
//         canvasRef.value?.addEventListener('touchmove', handleMove, {
//           passive: false,
//         });
//         window.addEventListener('touchend', handleEnd);
//         window.addEventListener('resize', setup);
//         lastTime = performance.now();
//         animationFrameId = requestAnimationFrame(animate);
//       })
//       .catch((error) => console.error('Could not load plane images:', error));
//   });
//   onUnmounted(() => {
//     cancelAnimationFrame(animationFrameId);
//     canvasRef.value?.removeEventListener('mousedown', handleStart);
//     canvasRef.value?.removeEventListener('mousemove', handleMove);
//     window.removeEventListener('mouseup', handleEnd);
//     canvasRef.value?.removeEventListener('touchstart', handleStart);
//     canvasRef.value?.removeEventListener('touchmove', handleMove);
//     window.removeEventListener('touchend', handleEnd);
//     window.removeEventListener('resize', setup);
//   });
// }

// ==========================================
// ==========================================
// ==========================================

function normalizePathByDistance(path: Point[], step: number): Point[] {
  if (path.length < 2) return path;
  const newPath: Point[] = [path[0]];
  let remainingDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const segmentDx = end.x - start.x;
    const segmentDy = end.y - start.y;
    const segmentLen = Math.sqrt(segmentDx ** 2 + segmentDy ** 2);
    if (segmentLen === 0) continue;
    const segmentDirX = segmentDx / segmentLen;
    const segmentDirY = segmentDy / segmentLen;
    let currentDist = step - remainingDist;
    while (currentDist < segmentLen) {
      newPath.push({
        x: start.x + segmentDirX * currentDist,
        y: start.y + segmentDirY * currentDist,
      });
      currentDist += step;
    }
    remainingDist = segmentLen - (currentDist - step);
  }
  return newPath;
}
function findClosestPointIndex(position: Point, path: Point[]): number {
  if (!path || path.length === 0) return 0;
  let closestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < path.length; i++) {
    const dx = position.x - path[i].x;
    const dy = position.y - path[i].y;
    const distance = dx * dx + dy * dy; // Use squared distance for efficiency
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  return closestIndex;
}

// --- NEW/MODIFIED: Helper for angle difference calculation ---
function getAngleDifference(angle1: number, angle2: number): number {
  let diff = angle2 - angle1;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return Math.abs(diff);
}

export function useAirTraffic(canvasRef: Ref<HTMLCanvasElement | null>) {
  const planes = ref<Plane[]>([]);
  const draggedPlane = ref<Plane | null>(null);
  const rawDragPath = ref<Point[] | null>(null);

  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrameId: number;
  const loadedPlaneImages: HTMLImageElement[] = [];

  const JANJO_WAYPOINT = {
    name: 'JANJO',
    x: 0,
    y: 0,
  };

  const DEPARTURE_STRIPS: Strip[] = [];
  const LANDING_STRIPS: Strip[] = [];
  let lastDepartureTime = 0;

  const getDistance = (p1: Point, p2: Point) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  const checkConflicts = () => {
    planes.value.forEach((p) => (p.warning = null));
    for (let i = 0; i < planes.value.length; i++) {
      for (let j = i + 1; j < planes.value.length; j++) {
        const p1 = planes.value[i];
        const p2 = planes.value[j];
        if (getDistance(p1, p2) < PLANE_CONFIG.CONFLICT_DISTANCE) {
          if (!p1.warning) p1.warning = { color: `#ff8f00` };
          p2.warning = p1.warning;
        }
      }
    }
  };
  const addPlane = (timestamp: number) => {
    // <-- NEW parameter: timestamp for interval check
    if (
      planes.value.length >= MAX_PLANES ||
      loadedPlaneImages.length === 0 ||
      !canvasRef.value
    ) {
      return;
    }

    const randomImage =
      loadedPlaneImages[Math.floor(Math.random() * loadedPlaneImages.length)];
    let newPlane: Plane;

    // Try to spawn from a departure strip if possible and interval allows
    if (
      DEPARTURE_STRIPS.length > 0 &&
      Math.random() < 0.5 &&
      timestamp - lastDepartureTime > PLANE_CONFIG.MIN_DEPARTURE_INTERVAL_MS
    ) {
      const randomStrip =
        DEPARTURE_STRIPS[Math.floor(Math.random() * DEPARTURE_STRIPS.length)];

      newPlane = new Plane(
        canvasRef.value.width,
        canvasRef.value.height,
        randomImage,
        0,
        1
      ); // Start at 0 scale, growing
      newPlane.x = randomStrip.x + randomStrip.width / 2; // Center of strip
      newPlane.y = randomStrip.y + randomStrip.height / 2; // Center of strip
      newPlane.angle = randomStrip.approachAngle; // Initial angle matches departure direction
      newPlane.isDeparting = true; // Mark as departing

      // Set an initial path to guide it off the strip
      const departureTargetX =
        newPlane.x +
        Math.cos(newPlane.angle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH;
      const departureTargetY =
        newPlane.y +
        Math.sin(newPlane.angle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH;
      newPlane.path = normalizePathByDistance(
        [
          { x: newPlane.x, y: newPlane.y },
          { x: departureTargetX, y: departureTargetY },
        ],
        PATH_NORMALIZED_STEP
      );
      newPlane.pathIndex = 0;

      lastDepartureTime = timestamp; // Update last departure time
    } else {
      // Spawn randomly at an edge if no departure strip or interval not met
      newPlane = new Plane(
        canvasRef.value.width,
        canvasRef.value.height,
        randomImage,
        1,
        0
      ); // Start at full scale
      newPlane.resetRandomEdgeSpawn();
    }
    planes.value.push(newPlane);
  };

  const drawWaypoint = (waypoint: typeof JANJO_WAYPOINT) => {
    if (!ctx) return;

    ctx.save();
    ctx.translate(waypoint.x, waypoint.y);

    // Draw the name
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right'; // Align text to the right of the icon
    ctx.textBaseline = 'middle';
    ctx.fillText(waypoint.name, 24, -26); // Offset to the left of the icon

    // Draw label 'track to Europe'
    ctx.font = '14px italian Arial'; // You can choose a different font style
    ctx.fillStyle = '#9e9e9e'; // Choose a color
    ctx.textAlign = 'right'; // Align the new text to the left
    ctx.textBaseline = 'middle';
    ctx.fillText('traffic queue to Europe ➜', -20, 2);

    // Draw the circular icon (like the image provided)
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2); // Outer circle
    ctx.arc(0, 0, 4, 0, Math.PI * 2); // Inner circle
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw the crosshairs inside the circle
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0); // Horizontal line
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 7); // Vertical line
    ctx.stroke();

    // Draw the white line to the right side ---
    // Define the angle and length
    const angleInDegrees = -12;
    const angleInRadians = angleInDegrees * (Math.PI / 180);
    const startX = 8; // Starting point just outside the circle
    const lineLength = 20; // Length of the line

    // Calculate the end coordinates using trigonometry
    const endX = startX + lineLength * Math.cos(angleInRadians);
    const endY = 0 + lineLength * Math.sin(angleInRadians);

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.moveTo(startX, -1);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
  };

  const drawStrip = (strip: Strip, color: string) => {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(strip.x, strip.y, strip.width, strip.height);
    ctx.setLineDash([]); // Reset line dash

    // --- NEW: Draw an arrow indicating approach/departure direction ---
    ctx.beginPath();
    const centerX = strip.x + strip.width / 2;
    const centerY = strip.y + strip.height / 2;

    // Length of the arrow line, scaled with the strip size
    const arrowLength = Math.min(strip.width, strip.height) * 0.8;
    const arrowHeadSize = 8; // Size of the arrowhead

    // Calculate start and end points of the arrow line
    const startX = centerX - (Math.cos(strip.approachAngle) * arrowLength) / 2;
    const startY = centerY - (Math.sin(strip.approachAngle) * arrowLength) / 2;
    const endX = centerX + (Math.cos(strip.approachAngle) * arrowLength) / 2;
    const endY = centerY + (Math.sin(strip.approachAngle) * arrowLength) / 2;

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw the arrowhead at the 'end' of the direction
    ctx.translate(endX, endY);
    ctx.rotate(strip.approachAngle);
    ctx.beginPath();
    ctx.moveTo(-arrowHeadSize, arrowHeadSize / 2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-arrowHeadSize, -arrowHeadSize / 2);
    ctx.stroke();

    ctx.restore();
  };

  let lastTime = 0;
  const animate = (timestamp: number) => {
    if (!ctx || !canvasRef.value) return;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    // Draw all assigned flight paths as faint dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    planes.value.forEach((plane) => {
      if (plane.path && plane.pathIndex < plane.path.length) {
        for (let i = plane.pathIndex; i < plane.path.length; i++) {
          const point = plane.path[i];
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Add plane logic
    if (
      planes.value.length < MIN_PLANES ||
      (planes.value.length < MAX_PLANES && Math.random() < 0.005)
    ) {
      addPlane(timestamp);
    }

    planes.value = planes.value.filter((p) => !p.isOffscreen);
    checkConflicts();

    planes.value.forEach((plane) => {
      plane.update(deltaTime);

      // --- REFINED LANDING DETECTION LOGIC ---
      // Only check for landing if the plane is not already landing or departing, is full scale, and not currently scaling.
      if (
        !plane.isLanding &&
        !plane.isDeparting &&
        plane.scale === 1 &&
        plane.scaleDirection === 0
      ) {
        for (const landingStrip of LANDING_STRIPS) {
          const isInStripBounds =
            plane.x >= landingStrip.x &&
            plane.x <= landingStrip.x + landingStrip.width &&
            plane.y >= landingStrip.y &&
            plane.y <= landingStrip.y + landingStrip.height;

          if (isInStripBounds) {
            // Use the new getAngleDifference helper for robust angle comparison
            const angleDiff = getAngleDifference(
              plane.angle,
              landingStrip.approachAngle
            );
            const isWithinAngle = angleDiff <= landingStrip.angleTolerance;

            if (isWithinAngle) {
              plane.scaleDirection = -1; // Initiate scale down (landing)
              plane.isLanding = true;
              plane.path = null; // Clear path as plane is now committed to landing
              break; // Plane is landing, no need to check other strips
            }
          }
        }
      }
      plane.draw(ctx!);
    });

    drawWaypoint(JANJO_WAYPOINT);
    DEPARTURE_STRIPS.forEach((strip) =>
      drawStrip(strip, 'rgba(255, 255, 0, 0.7)')
    );
    LANDING_STRIPS.forEach((strip) => drawStrip(strip, 'rgba(0, 255, 0, 0.7)'));

    animationFrameId = requestAnimationFrame(animate);
  };

  const getEventPoint = (e: MouseEvent | TouchEvent): Point => {
    const rect = canvasRef.value!.getBoundingClientRect();
    const pos = 'touches' in e ? e.touches[0] : e;
    return { x: pos.clientX - rect.left, y: pos.clientY - rect.top };
  };
  const handleStart = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const point = getEventPoint(e);
    for (let i = planes.value.length - 1; i >= 0; i--) {
      const plane = planes.value[i];
      if (plane.isPointOnIcon(point)) {
        draggedPlane.value = plane;
        // Start collecting the raw path from the plane's position
        rawDragPath.value = [{ x: plane.x, y: plane.y }];
        // Clear any previous path immediately
        plane.path = null;
        break;
      }
    }
  };
  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!draggedPlane.value || !rawDragPath.value) return;
    e.preventDefault();
    const point = getEventPoint(e);
    const lastPoint = rawDragPath.value[rawDragPath.value.length - 1];

    if (getDistance(point, lastPoint) > PATH_RAW_SIMPLIFY_THRESHOLD) {
      rawDragPath.value.push(point);

      const normalizedPath = normalizePathByDistance(
        rawDragPath.value,
        PATH_NORMALIZED_STEP
      );

      // --- THIS IS THE NEW LOGIC ---
      // 1. Find the index on the new path closest to the plane's CURRENT position.
      const closestIndex = findClosestPointIndex(
        { x: draggedPlane.value.x, y: draggedPlane.value.y },
        normalizedPath
      );

      // 2. Assign the full new path to the plane.
      draggedPlane.value.path = normalizedPath;
      // 3. Tell the plane to start following from that closest point, not from the beginning.
      draggedPlane.value.pathIndex = closestIndex;
    }
  };
  const handleEnd = () => {
    draggedPlane.value = null;
    rawDragPath.value = null;
  };

  const setup = () => {
    if (!canvasRef.value) return;
    ctx = canvasRef.value.getContext('2d');
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
    planes.value = [];
    lastDepartureTime = performance.now();

    DEPARTURE_STRIPS.length = 0;
    LANDING_STRIPS.length = 0;

    DEPARTURE_STRIPS.push({
      id: 'DEP01',
      x: 100,
      y: 100,
      width: 150,
      height: 50,
      approachAngle: Math.PI / 2, // Departing towards South (Down)
      angleTolerance: Math.PI / 8,
    });
    DEPARTURE_STRIPS.push({
      id: 'DEP02',
      x: canvasRef.value.width - 250,
      y: 100,
      width: 150,
      height: 50,
      approachAngle: Math.PI / 2 + Math.PI / 4,
      angleTolerance: Math.PI / 8,
    });

    LANDING_STRIPS.push({
      id: 'LAND01',
      x: 100,
      y: canvasRef.value.height - 150,
      width: 150,
      height: 50,
      approachAngle: -Math.PI / 2, // Approaching from North (Up)
      angleTolerance: Math.PI / 8,
    });
    // Example: Another landing strip in the bottom-right, approaching from NW
    LANDING_STRIPS.push({
      id: 'LAND02',
      x: canvasRef.value.width - 250,
      y: canvasRef.value.height - 150,
      width: 150,
      height: 50,
      approachAngle: -Math.PI / 2 - Math.PI / 4, // Approaching from North-West (Up-Left)
      angleTolerance: Math.PI / 8,
    });
    // Example: Landing strip on the right, approaching from West
    LANDING_STRIPS.push({
      id: 'LAND03',
      x: canvasRef.value.width - 100,
      y: canvasRef.value.height / 2 - 25,
      width: 50,
      height: 150,
      approachAngle: Math.PI, // Approaching from West (Left)
      angleTolerance: Math.PI / 8,
    });

    JANJO_WAYPOINT.x = canvasRef.value.width - 60;
    JANJO_WAYPOINT.y = canvasRef.value.height / 2;

    addPlane(performance.now());
  };

  onMounted(() => {
    const imagePromises = planeIconUrls.map(
      (url) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(img);
          img.onerror = () => reject(`Failed to load image at ${url}`);
        })
    );
    Promise.all(imagePromises)
      .then((images) => {
        loadedPlaneImages.push(...images);
        setup();
        canvasRef.value?.addEventListener('mousedown', handleStart);
        canvasRef.value?.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        canvasRef.value?.addEventListener('touchstart', handleStart, {
          passive: false,
        });
        canvasRef.value?.addEventListener('touchmove', handleMove, {
          passive: false,
        });
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('resize', setup);
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      })
      .catch((error) => console.error('Could not load plane images:', error));
  });
  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    canvasRef.value?.removeEventListener('mousedown', handleStart);
    canvasRef.value?.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    canvasRef.value?.removeEventListener('touchstart', handleStart);
    canvasRef.value?.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);
    window.removeEventListener('resize', setup);
  });
}
