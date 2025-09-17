import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  Plane,
  PLANE_CONFIG,
  type Point,
  type Runway,
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

/**
 * Processes a raw path of points and converts it into a new path where
 * all points are a fixed distance apart. This is the key to smooth movement
 * and uniform dot rendering.
 * @param path The raw path from user input.
 * @param step The desired distance between points.
 * @returns A new, evenly-spaced path.
 */
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

// export function useAirTraffic(canvasRef: Ref<HTMLCanvasElement | null>) {
//   const planes = ref<Plane[]>([]);
//   const draggedPlane = ref<Plane | null>(null);
//   const rawDragPath = ref<Point[] | null>(null);

//   let ctx: CanvasRenderingContext2D | null = null;
//   let animationFrameId: number;
//   const loadedPlaneImages: HTMLImageElement[] = [];

//   const JANJO_WAYPOINT = {
//     name: 'JANJO',
//     x: 0,
//     y: 0,
//   };

//   const runways = ref<Runway[]>([]);
//   let lastDepartureTime = 0;

//   const getDistance = (p1: Point, p2: Point) =>
//     Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

// const checkConflicts = () => {
//   planes.value.forEach((p) => (p.warning = null));
//   for (let i = 0; i < planes.value.length; i++) {
//     for (let j = i + 1; j < planes.value.length; j++) {
//       const p1 = planes.value[i];
//       const p2 = planes.value[j];
//       if (getDistance(p1, p2) < PLANE_CONFIG.CONFLICT_DISTANCE) {
//         if (!p1.warning) p1.warning = { color: `#ff8f00` };
//         p2.warning = p1.warning;
//       }
//     }
//   }
// };

//   // --- MODIFIED: Helper to create a Runway object with correct direction logic ---
//   const createRunway = (
//     id: string,
//     centerX: number,
//     centerY: number,
//     direction: number, // The direction of traffic flow (0 for East, PI/2 for South, etc.)
//     length: number = 100,
//     width: number = 10,
//     angleTolerance: number = Math.PI / 8
//   ): Runway => {
//     // Both landing approach and departure use the same 'direction' angle.
//     const landingApproachAngle = direction;
//     const departureAngle = direction;

//     const halfLength = length / 2;

//     // Departure Point: At the "start" of the runway in its direction
//     const departurePoint = {
//       x: centerX - Math.cos(direction) * halfLength, // Backwards from direction
//       y: centerY - Math.sin(direction) * halfLength,
//     };

//     // Landing Point: At the "end" of the runway in its direction
//     const landingPoint = {
//       x: centerX + Math.cos(direction) * halfLength, // Forwards in direction
//       y: centerY + Math.sin(direction) * halfLength,
//     };

//     // Landing Approach Point: One plane length BEFORE the landingPoint, along the direction
//     const landingApproachPoint = {
//       x: landingPoint.x - Math.cos(direction) * PLANE_CONFIG.SIZE,
//       y: landingPoint.y - Math.sin(direction) * PLANE_CONFIG.SIZE,
//     };

//     return {
//       id,
//       centerX,
//       centerY,
//       direction,
//       length,
//       width,
//       landingApproachAngle,
//       departureAngle,
//       landingPoint,
//       departurePoint,
//       landingApproachPoint,
//       angleTolerance,
//     };
//   };

//   // --- MODIFIED ADDPLANE: Uses departurePoint and departureAngle ---
//   const addPlane = (timestamp: number) => {
//     if (
//       planes.value.length >= MAX_PLANES ||
//       loadedPlaneImages.length === 0 ||
//       !canvasRef.value
//     ) {
//       return;
//     }

//     const randomImage =
//       loadedPlaneImages[Math.floor(Math.random() * loadedPlaneImages.length)];
//     let newPlane: Plane;

//     if (
//       runways.value.length > 0 &&
//       Math.random() < 0.5 &&
//       timestamp - lastDepartureTime > PLANE_CONFIG.MIN_DEPARTURE_INTERVAL_MS
//     ) {
//       const randomRunway =
//         runways.value[Math.floor(Math.random() * runways.value.length)];

//       newPlane = new Plane(
//         canvasRef.value.width,
//         canvasRef.value.height,
//         randomImage,
//         0,
//         1
//       ); // Start at 0 scale, growing
//       newPlane.x = randomRunway.departurePoint.x;
//       newPlane.y = randomRunway.departurePoint.y;
//       newPlane.angle = randomRunway.departureAngle; // Initial angle matches departure direction
//       newPlane.isDeparting = true;

//       // Set an initial path to guide it off the runway
//       const departureTargetX =
//         newPlane.x +
//         Math.cos(newPlane.angle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH;
//       const departureTargetY =
//         newPlane.y +
//         Math.sin(newPlane.angle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH;
//       newPlane.path = normalizePathByDistance(
//         [
//           { x: newPlane.x, y: newPlane.y },
//           { x: departureTargetX, y: departureTargetY },
//         ],
//         PATH_NORMALIZED_STEP
//       );
//       newPlane.pathIndex = 0;

//       lastDepartureTime = timestamp;
//     } else {
//       newPlane = new Plane(
//         canvasRef.value.width,
//         canvasRef.value.height,
//         randomImage,
//         1,
//         0
//       );
//       newPlane.resetRandomEdgeSpawn();
//     }
//     planes.value.push(newPlane);
//   };

//   // !!! customized
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

//   // --- MODIFIED: drawRunway function ---
//   const drawRunway = (runway: Runway) => {
//     if (!ctx) return;
//     ctx.save();
//     ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White for the main runway outline
//     ctx.lineWidth = 2;
//     ctx.setLineDash([10, 5]);

//     // Translate to the center of the runway and rotate
//     ctx.translate(runway.centerX, runway.centerY);
//     ctx.rotate(runway.direction); // Rotate by the 'direction' property

//     // Draw the main rectangle of the runway
//     ctx.strokeRect(
//       -runway.length / 2,
//       -runway.width / 2,
//       runway.length,
//       runway.width
//     );
//     ctx.setLineDash([]);

//     // --- Draw Landing Area (light pink rectangle) ---
//     ctx.fillStyle = 'rgba(255, 192, 203, 0.2)'; // Light pink, 20% opacity
//     // Landing area is FROM landingApproachPoint TO landingPoint (relative to runway center/rotation)
//     const landingAreaStartX = runway.length / 2 - PLANE_CONFIG.SIZE; // Starts 1 plane length before the end
//     const landingAreaWidth = PLANE_CONFIG.SIZE; // Length of the landing zone
//     ctx.fillRect(
//       landingAreaStartX,
//       -runway.width / 2,
//       landingAreaWidth,
//       runway.width
//     );

//     // --- Draw Landing End Arrow (Green) ---
//     ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)'; // Green for landing
//     const arrowLength = runway.length * 0.2; // Shorter arrow
//     const arrowHeadSize = 8;

//     // Position arrow slightly BEFORE the landing end, pointing INTO the runway along its direction
//     const landingArrowX = runway.length / 2 - arrowLength / 2; // Halfway between landingApproachPoint and landingPoint
//     const landingArrowY = 0;

//     ctx.beginPath();
//     // Line points from (landingArrowX - arrowLength/2) to (landingArrowX + arrowLength/2) in local x-axis
//     ctx.moveTo(landingArrowX - arrowLength / 2, landingArrowY);
//     ctx.lineTo(landingArrowX + arrowLength / 2, landingArrowY);
//     ctx.stroke();
//     // Arrowhead for landing (pointing to the right in local coords)
//     ctx.beginPath();
//     ctx.moveTo(
//       landingArrowX + arrowLength / 2 - arrowHeadSize,
//       landingArrowY - arrowHeadSize / 2
//     );
//     ctx.lineTo(landingArrowX + arrowLength / 2, landingArrowY);
//     ctx.lineTo(
//       landingArrowX + arrowLength / 2 - arrowHeadSize,
//       landingArrowY + arrowHeadSize / 2
//     );
//     ctx.stroke();

//     // --- Draw Departure End Arrow (Yellow) ---
//     ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)'; // Yellow for departure
//     // Position arrow slightly AFTER the departure end (opposite end), pointing AWAY from runway
//     const departureArrowX = -runway.length / 2 - arrowLength / 2;
//     const departureArrowY = 0;

//     ctx.beginPath();
//     // Line points from (departureArrowX + arrowLength/2) to (departureArrowX - arrowLength/2) in local x-axis
//     ctx.moveTo(departureArrowX + arrowLength / 2, departureArrowY);
//     ctx.lineTo(departureArrowX - arrowLength / 2, departureArrowY);
//     ctx.stroke();
//     // Arrowhead for departure (pointing to the left in local coords)
//     ctx.beginPath();
//     ctx.moveTo(
//       departureArrowX - arrowLength / 2 + arrowHeadSize,
//       departureArrowY - arrowHeadSize / 2
//     );
//     ctx.lineTo(departureArrowX - arrowLength / 2, departureArrowY);
//     ctx.lineTo(
//       departureArrowX - arrowLength / 2 + arrowHeadSize,
//       departureArrowY + arrowHeadSize / 2
//     );
//     ctx.stroke();

//     // --- Draw Departure Point (Yellow Circle) ---
//     ctx.fillStyle = 'yellow';
//     ctx.beginPath();
//     // Coordinates are relative to runway's center and rotation
//     const depPointX = -runway.length / 2; // "Start" of the runway
//     const depPointY = 0;
//     ctx.arc(depPointX, depPointY, 5, 0, Math.PI * 2);
//     ctx.fill();

//     // --- Draw Arrival Point (Green Circle) ---
//     ctx.fillStyle = 'lime'; // Using 'lime' for a brighter green
//     ctx.beginPath();
//     // Coordinates are relative to runway's center and rotation
//     const arrPointX = runway.length / 2; // "End" of the runway
//     const arrPointY = 0;
//     ctx.arc(arrPointX, arrPointY, 5, 0, Math.PI * 2);
//     ctx.fill();

//     ctx.restore();
//   };

//   let lastTime = 0;
//   const animate = (timestamp: number) => {
//     if (!ctx || !canvasRef.value) return;
//     const deltaTime = timestamp - lastTime;
//     lastTime = timestamp;

//     ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

//     ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
//     planes.value.forEach((plane) => {
//       if (
//         plane.path &&
//         plane.path.length > 0 &&
//         plane.pathIndex < plane.path.length
//       ) {
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
//     ) {
//       addPlane(timestamp);
//     }

//     planes.value = planes.value.filter((p) => !p.isOffscreen);
//     checkConflicts();

//     planes.value.forEach((plane) => {
//       plane.update(deltaTime);

//       // --- LANDING DETECTION LOGIC: Check against landingApproachPoint ---
//       if (
//         !plane.isLanding &&
//         !plane.isDeparting &&
//         plane.scale === 1 &&
//         plane.scaleDirection === 0
//       ) {
//         for (const runway of runways.value) {
//           const distanceToApproachPoint = getDistance(
//             plane,
//             runway.landingApproachPoint
//           );

//           if (distanceToApproachPoint < PLANE_CONFIG.SIZE / 2) {
//             // Within half a plane size of the start of landing zone
//             const angleDiff = getAngleDifference(
//               plane.angle,
//               runway.landingApproachAngle
//             );
//             const isWithinAngle = angleDiff <= runway.angleTolerance;

//             if (isWithinAngle) {
//               plane.scaleDirection = -1; // Initiate scale down (landing)
//               plane.isLanding = true;
//               plane.path = null; // Clear path
//               // Set the target for smooth landing movement to the *true* landingPoint (end of runway)
//               plane.setLandingTarget(
//                 runway.landingPoint.x,
//                 runway.landingPoint.y
//               );
//               break; // Plane is landing, no need to check other runways
//             }
//           }
//         }
//       }
//       plane.draw(ctx!);
//     });

//     drawWaypoint(JANJO_WAYPOINT);
//     runways.value.forEach((runway) => drawRunway(runway));

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
//     planes.value = [];
//     lastDepartureTime = performance.now();

//     runways.value.length = 0;

//     // --- CONFIGURE YOUR RUNWAYS HERE ---
//     // Default length 100, width 10, angleTolerance Math.PI / 8
//     // Example: Horizontal runway, traffic flow East (right)
//     runways.value.push(
//       createRunway('RWY01', 200, canvasRef.value.height - 100, 0)
//     );
//     // Example: Vertical runway, traffic flow South (down)
//     runways.value.push(
//       createRunway('RWY02', canvasRef.value.width - 150, 150, Math.PI / 2)
//     );
//     // Example: Diagonal runway, traffic flow South-East (down-right)
//     runways.value.push(
//       createRunway(
//         'RWY03',
//         canvasRef.value.width / 2,
//         canvasRef.value.height / 2,
//         Math.PI / 4
//       )
//     );
//     // Example: Horizontal runway, traffic flow West (left)
//     runways.value.push(createRunway('RWY04', 200, 300, Math.PI));

//     JANJO_WAYPOINT.x = canvasRef.value.width - 60;
//     JANJO_WAYPOINT.y = canvasRef.value.height / 2;

//     addPlane(performance.now());
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

/// --------------------------------
/// --------------------------------
/// --------------------------------
/// --------------------------------

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

  const runways = ref<Runway[]>([]);
  let lastDepartureTime = 0;
  let lastRandomSpawnTime = 0; // New: for queuing random spawns

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

  // --- MODIFIED: Helper to create a Runway object with CORRECTED points ---
  const createRunway = (
    id: string,
    centerX: number,
    centerY: number,
    direction: number, // The direction of traffic flow (0 for East, PI/2 for South, etc.)
    length: number = 100,
    width: number = 10,
    angleTolerance: number = Math.PI / 8
  ): Runway => {
    // Both landing approach and departure use the same 'direction' angle.
    const landingApproachAngle = direction;
    const departureAngle = direction;

    const halfLength = length / 2;

    // --- NEW: Departure Point (Yellow Circle) is at the FAR end of the runway ---
    const departurePoint = {
      x: centerX + Math.cos(direction) * halfLength,
      y: centerY + Math.sin(direction) * halfLength,
    };

    // --- NEW: Landing Point (Green Circle) is at the NEAR end of the runway ---
    const landingPoint = {
      x: centerX - Math.cos(direction) * halfLength,
      y: centerY - Math.sin(direction) * halfLength,
    };

    // Landing Approach Point: One plane length BEFORE the landingPoint, along the direction
    // So, it's further back AGAINST the direction from the landingPoint.
    const landingApproachPoint = {
      x: landingPoint.x - Math.cos(direction) * PLANE_CONFIG.SIZE,
      y: landingPoint.y - Math.sin(direction) * PLANE_CONFIG.SIZE,
    };

    return {
      id,
      centerX,
      centerY,
      direction,
      length,
      width,
      landingApproachAngle,
      departureAngle,
      landingPoint,
      departurePoint,
      landingApproachPoint,
      angleTolerance,
    };
  };

  // --- MODIFIED ADDPLANE: Reworked for all planes to appear smoothly ---
  const addPlane = (timestamp: number) => {
    if (
      planes.value.length >= MAX_PLANES ||
      loadedPlaneImages.length === 0 ||
      !canvasRef.value
    ) {
      return;
    }

    const randomImage =
      loadedPlaneImages[Math.floor(Math.random() * loadedPlaneImages.length)];
    const newPlane = new Plane(
      canvasRef.value.width,
      canvasRef.value.height,
      randomImage
    );

    // Option 1: Spawn from a runway (departure queue)
    if (
      runways.value.length > 0 &&
      Math.random() < 0.5 &&
      timestamp - lastDepartureTime > PLANE_CONFIG.MIN_DEPARTURE_INTERVAL_MS
    ) {
      const randomRunway =
        runways.value[Math.floor(Math.random() * runways.value.length)];

      // Initial position is at the departure point of the runway
      const startX = randomRunway.departurePoint.x;
      const startY = randomRunway.departurePoint.y;
      const startAngle = randomRunway.departureAngle;

      // Create initial path to guide it off the runway
      const targetPathX =
        startX + Math.cos(startAngle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH;
      const targetPathY =
        startY + Math.sin(startAngle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH;
      const path = normalizePathByDistance(
        [
          { x: startX, y: startY },
          { x: targetPathX, y: targetPathY },
        ],
        PATH_NORMALIZED_STEP
      );

      newPlane.initSpawn(startX, startY, startAngle, path, 0, 1, true); // Start at 0 scale, growing
      lastDepartureTime = timestamp;
    } else if (
      timestamp - lastRandomSpawnTime >
      PLANE_CONFIG.MIN_DEPARTURE_INTERVAL_MS * 0.75
    ) {
      // Option 2: Spawn from a random edge with grow animation
      const edge = Math.floor(Math.random() * 4);
      let startX: number, startY: number, initialAngle: number;
      let targetX: number, targetY: number;

      switch (edge) {
        case 0: // Top edge, appears from above
          startX = Math.random() * canvasRef.value.width;
          startY = -PLANE_CONFIG.SIZE * 2; // Start off screen
          initialAngle = Math.PI / 2; // Pointing down
          targetX = startX;
          targetY = PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          break;
        case 1: // Right edge, appears from right
          startX = canvasRef.value.width + PLANE_CONFIG.SIZE * 2;
          startY = Math.random() * canvasRef.value.height;
          initialAngle = Math.PI; // Pointing left
          targetX =
            canvasRef.value.width - PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          targetY = startY;
          break;
        case 2: // Bottom edge, appears from below
          startX = Math.random() * canvasRef.value.width;
          startY = canvasRef.value.height + PLANE_CONFIG.SIZE * 2;
          initialAngle = (3 * Math.PI) / 2; // Pointing up
          targetX = startX;
          targetY =
            canvasRef.value.height - PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          break;
        case 3: // Left edge, appears from left
          startX = -PLANE_CONFIG.SIZE * 2;
          startY = Math.random() * canvasRef.value.height;
          initialAngle = 0; // Pointing right
          targetX = PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          targetY = startY;
          break;
        default:
          startX = 0;
          startY = 0;
          initialAngle = 0;
          targetX = 0;
          targetY = 0; // Fallback
      }

      // Create an initial path for the plane to fly into view smoothly
      const path = normalizePathByDistance(
        [
          { x: startX, y: startY },
          { x: targetX, y: targetY },
        ],
        PATH_NORMALIZED_STEP
      );

      newPlane.initSpawn(startX, startY, initialAngle, path, 0, 1, false); // Grow into view
      lastRandomSpawnTime = timestamp; // Update last spawn time
    } else {
      return; // Don't add a plane if conditions not met
    }
    planes.value.push(newPlane);
  };

  // !!! customized
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

  // --- MODIFIED: drawRunway function with CORRECTED visuals ---
  const drawRunway = (runway: Runway) => {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White for the main runway outline
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);

    // Translate to the center of the runway and rotate
    ctx.translate(runway.centerX, runway.centerY);
    ctx.rotate(runway.direction); // Rotate by the 'direction' property

    // Draw the main rectangle of the runway
    ctx.strokeRect(
      -runway.length / 2,
      -runway.width / 2,
      runway.length,
      runway.width
    );
    ctx.setLineDash([]);

    // --- Draw Landing Area (light pink rectangle) ---
    ctx.fillStyle = 'rgba(255, 192, 203, 0.2)'; // Light pink, 20% opacity
    // The landing area is from landingApproachPoint to landingPoint
    // In local coordinates, landingPoint is at -halfLength. landingApproachPoint is at -halfLength - PLANE_CONFIG.SIZE
    // So the area starts at -halfLength - PLANE_CONFIG.SIZE and has length PLANE_CONFIG.SIZE
    const landingAreaLocalStartX = -runway.length / 2 - PLANE_CONFIG.SIZE;
    const landingAreaWidth = PLANE_CONFIG.SIZE;
    ctx.fillRect(
      landingAreaLocalStartX,
      -runway.width / 2,
      landingAreaWidth,
      runway.width
    );

    // --- Draw Landing End Arrow (Green) ---
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)'; // Green for landing
    const arrowLength = runway.length * 0.2; // Shorter arrow
    const arrowHeadSize = 8;

    // Position arrow slightly BEFORE the landing end (which is -halfLength), pointing into the runway (RIGHT in local coords)
    const landingArrowLocalX = -runway.length / 2 - arrowLength / 2; // Midway in the pre-runway landing zone
    const landingArrowLocalY = 0;

    ctx.beginPath();
    // Line points from (landingArrowLocalX - arrowLength/2) to (landingArrowLocalX + arrowLength/2) in local x-axis
    ctx.moveTo(landingArrowLocalX - arrowLength / 2, landingArrowLocalY);
    ctx.lineTo(landingArrowLocalX + arrowLength / 2, landingArrowLocalY);
    ctx.stroke();
    // Arrowhead for landing (pointing to the right in local coords, which is INTO the runway)
    ctx.beginPath();
    ctx.moveTo(
      landingArrowLocalX + arrowLength / 2 - arrowHeadSize,
      landingArrowLocalY - arrowHeadSize / 2
    );
    ctx.lineTo(landingArrowLocalX + arrowLength / 2, landingArrowLocalY);
    ctx.lineTo(
      landingArrowLocalX + arrowLength / 2 - arrowHeadSize,
      landingArrowLocalY + arrowHeadSize / 2
    );
    ctx.stroke();

    // --- Draw Departure End Arrow (Yellow) ---
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)'; // Yellow for departure
    // Position arrow slightly AFTER the departure end (which is +halfLength), pointing AWAY from runway (RIGHT in local coords)
    const departureArrowLocalX = runway.length / 2 + arrowLength / 2; // Midway in the post-runway departure zone
    const departureArrowLocalY = 0;

    ctx.beginPath();
    // Line points from (departureArrowLocalX - arrowLength/2) to (departureArrowLocalX + arrowLength/2) in local x-axis
    ctx.moveTo(departureArrowLocalX - arrowLength / 2, departureArrowLocalY);
    ctx.lineTo(departureArrowLocalX + arrowLength / 2, departureArrowLocalY);
    ctx.stroke();
    // Arrowhead for departure (pointing to the right in local coords, which is AWAY from the runway)
    ctx.beginPath();
    ctx.moveTo(
      departureArrowLocalX + arrowLength / 2 - arrowHeadSize,
      departureArrowLocalY - arrowHeadSize / 2
    );
    ctx.lineTo(departureArrowLocalX + arrowLength / 2, departureArrowLocalY);
    ctx.lineTo(
      departureArrowLocalX + arrowLength / 2 - arrowHeadSize,
      departureArrowLocalY + arrowHeadSize / 2
    );
    ctx.stroke();

    // --- Draw Departure Point (Yellow Circle) ---
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    // The departure point is at the "end" of the runway in the direction of flow (+halfLength)
    const depPointLocalX = runway.length / 2;
    const depPointLocalY = 0;
    ctx.arc(depPointLocalX, depPointLocalY, 5, 0, Math.PI * 2);
    ctx.fill();

    // --- Draw Arrival Point (Green Circle) ---
    ctx.fillStyle = 'lime'; // Using 'lime' for a brighter green
    ctx.beginPath();
    // The arrival point is at the "start" of the runway in the direction of flow (-halfLength)
    const arrPointLocalX = -runway.length / 2;
    const arrPointLocalY = 0;
    ctx.arc(arrPointLocalX, arrPointLocalY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  let lastTime = 0;
  const animate = (timestamp: number) => {
    if (!ctx || !canvasRef.value) return;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    planes.value.forEach((plane) => {
      if (
        plane.path &&
        plane.path.length > 0 &&
        plane.pathIndex < plane.path.length
      ) {
        // Only draw remaining path if plane is not currently landing
        if (!plane.isLanding) {
          for (let i = plane.pathIndex; i < plane.path.length; i++) {
            const point = plane.path[i];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });

    // Add plane logic - using the reworked addPlane
    // Spawn more if below MIN_PLANES, or randomly if below MAX_PLANES
    if (
      planes.value.filter((p) => !p.isLanding).length < MIN_PLANES ||
      (planes.value.filter((p) => !p.isLanding).length < MAX_PLANES &&
        Math.random() < 0.005)
    ) {
      addPlane(timestamp);
    }

    planes.value = planes.value.filter((p) => !p.isOffscreen);
    checkConflicts();

    planes.value.forEach((plane) => {
      plane.update(deltaTime);

      // --- LANDING DETECTION LOGIC: Check against landingApproachPoint ---
      if (
        !plane.isLanding &&
        !plane.isDeparting &&
        plane.scale === 1 &&
        plane.scaleDirection === 0
      ) {
        for (const runway of runways.value) {
          const distanceToApproachPoint = getDistance(
            plane,
            runway.landingApproachPoint
          );

          if (distanceToApproachPoint < PLANE_CONFIG.SIZE / 2) {
            // Within half a plane size of the start of landing zone
            const angleDiff = getAngleDifference(
              plane.angle,
              runway.landingApproachAngle
            );
            const isWithinAngle = angleDiff <= runway.angleTolerance;

            if (isWithinAngle) {
              plane.scaleDirection = -1; // Initiate scale down (landing)
              plane.isLanding = true;
              plane.path = null; // Clear path on landing, movement handled by interpolation
              // Set the target for smooth landing movement to the *true* landingPoint (start of runway)
              plane.setLandingTarget(
                runway.landingPoint.x,
                runway.landingPoint.y
              );
              break; // Plane is landing, no need to check other runways
            }
          }
        }
      }
      plane.draw(ctx!);
    });

    drawWaypoint(JANJO_WAYPOINT);
    runways.value.forEach((runway) => drawRunway(runway));

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
    lastRandomSpawnTime = performance.now(); // Initialize random spawn time

    runways.value.length = 0;

    // --- CONFIGURE YOUR RUNWAYS HERE ---
    // Default length 100, width 10, angleTolerance Math.PI / 8
    // Example: Horizontal runway, traffic flow East (right)
    runways.value.push(
      createRunway('RWY01', 200, canvasRef.value.height - 100, 0)
    );
    // Example: Vertical runway, traffic flow South (down)
    runways.value.push(
      createRunway('RWY02', canvasRef.value.width - 150, 150, Math.PI / 2)
    );
    // Example: Diagonal runway, traffic flow South-East (down-right)
    runways.value.push(
      createRunway(
        'RWY03',
        canvasRef.value.width / 2,
        canvasRef.value.height / 2,
        Math.PI / 4
      )
    );
    // Example: Horizontal runway, traffic flow West (left)
    runways.value.push(createRunway('RWY04', 200, 300, Math.PI));

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
