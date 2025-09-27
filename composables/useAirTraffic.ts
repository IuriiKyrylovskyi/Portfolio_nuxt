import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  Plane,
  PLANE_CONFIG,
  type Point,
  type Runway,
} from '~/interfaces/traffic';

export interface Waypoint {
  name: string;
  x: number;
  y: number;
  description?: string;
}
export interface RunwayConfig {
  id: string;
  centerX: number;
  centerY: number;
  direction: number;
  length?: number;
  width?: number;
  angleTolerance?: number;
}
export interface AirTrafficOptions {
  runways: (width: number, height: number) => RunwayConfig[];
  waypoints: (width: number, height: number) => Waypoint[];
  planeIconUrls: string[];
}

const normalizePathByDistance = (path: Point[], step: number): Point[] => {
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
};
const findClosestPointIndex = (position: Point, path: Point[]): number => {
  if (!path || path.length === 0) return 0;
  let closestIndex = 0;
  let minDistance = Infinity;
  for (let i = 0; i < path.length; i++) {
    const dx = position.x - path[i].x;
    const dy = position.y - path[i].y;
    const distance = dx * dx + dy * dy;
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  return closestIndex;
};
const getAngleDifference = (angle1: number, angle2: number): number => {
  let diff = angle2 - angle1;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return Math.abs(diff);
};
const createGhostImage = (
  image: HTMLImageElement
): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(image);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    const ghostImage = new Image();
    ghostImage.src = canvas.toDataURL();
    ghostImage.onload = () => resolve(ghostImage);
  });
};

const MAX_PLANES = 7;
const MIN_PLANES = 1;
const PATH_RAW_SIMPLIFY_THRESHOLD = 20;
const PATH_NORMALIZED_STEP = 10;

export function useAirTraffic(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: AirTrafficOptions
) {
  const planes = ref<Plane[]>([]);
  const runways = ref<Runway[]>([]);
  const waypoints = ref<Waypoint[]>([]);
  const draggedPlane = ref<Plane | null>(null);
  const rawDragPath = ref<Point[] | null>(null);
  const landingProjection = ref<{ runway: Runway; plane: Plane } | null>(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrameId: number;
  const loadedPlaneImages: {
    main: HTMLImageElement;
    ghost: HTMLImageElement;
  }[] = [];
  let lastDepartureTime = 0;
  let lastRandomSpawnTime = 0;
  const {
    runways: runwayConfigGenerator,
    waypoints: waypointConfigGenerator,
    planeIconUrls,
  } = options;

  const getDistance = (p1: Point, p2: Point) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  const createRunway = (
    id: string,
    centerX: number,
    centerY: number,
    direction: number,
    length = 100,
    width = 10,
    angleTolerance = Math.PI / 8
  ): Runway => {
    const halfLength = length / 2;
    const landingPoint = {
      x: centerX - Math.cos(direction) * halfLength,
      y: centerY - Math.sin(direction) * halfLength,
    };
    return {
      id,
      centerX,
      centerY,
      direction,
      length,
      width,
      angleTolerance,
      landingApproachAngle: direction,
      departureAngle: direction,
      landingPoint,
      departurePoint: {
        x: centerX + Math.cos(direction) * halfLength,
        y: centerY + Math.sin(direction) * halfLength,
      },
      landingApproachPoint: {
        x: landingPoint.x - Math.cos(direction) * PLANE_CONFIG.SIZE,
        y: landingPoint.y - Math.sin(direction) * PLANE_CONFIG.SIZE,
      },
    };
  };
  const addPlane = (timestamp: number) => {
    if (
      planes.value.length >= MAX_PLANES ||
      loadedPlaneImages.length === 0 ||
      !canvasRef.value
    )
      return;
    const randomImages =
      loadedPlaneImages[Math.floor(Math.random() * loadedPlaneImages.length)];
    const newPlane = new Plane(
      canvasRef.value.width,
      canvasRef.value.height,
      randomImages.main,
      randomImages.ghost
    );
    if (
      runways.value.length > 0 &&
      Math.random() < 0.5 &&
      timestamp - lastDepartureTime > PLANE_CONFIG.MIN_DEPARTURE_INTERVAL_MS
    ) {
      const runway =
        runways.value[Math.floor(Math.random() * runways.value.length)];
      const { x, y } = runway.departurePoint;
      const angle = runway.departureAngle;
      const path = normalizePathByDistance(
        [
          { x, y },
          {
            x: x + Math.cos(angle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH,
            y: y + Math.sin(angle) * PLANE_CONFIG.DEPARTURE_PATH_LENGTH,
          },
        ],
        PATH_NORMALIZED_STEP
      );
      newPlane.initSpawn(x, y, angle, path, 0, 1, true);
      lastDepartureTime = timestamp;
    } else if (
      timestamp - lastRandomSpawnTime >
      PLANE_CONFIG.MIN_DEPARTURE_INTERVAL_MS * 0.75
    ) {
      const edge = Math.floor(Math.random() * 4);
      let sx, sy, sa, tx, ty;
      switch (edge) {
        case 0:
          sx = Math.random() * canvasRef.value.width;
          sy = -PLANE_CONFIG.SIZE * 2;
          sa = Math.PI / 2;
          tx = sx;
          ty = PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          break;
        case 1:
          sx = canvasRef.value.width + PLANE_CONFIG.SIZE * 2;
          sy = Math.random() * canvasRef.value.height;
          sa = Math.PI;
          tx = canvasRef.value.width - PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          ty = sy;
          break;
        case 2:
          sx = Math.random() * canvasRef.value.width;
          sy = canvasRef.value.height + PLANE_CONFIG.SIZE * 2;
          sa = (3 * Math.PI) / 2;
          tx = sx;
          ty = canvasRef.value.height - PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          break;
        default:
          sx = -PLANE_CONFIG.SIZE * 2;
          sy = Math.random() * canvasRef.value.height;
          sa = 0;
          tx = PLANE_CONFIG.INITIAL_APPEAR_PATH_LENGTH;
          ty = sy;
          break;
      }
      newPlane.initSpawn(
        sx,
        sy,
        sa,
        normalizePathByDistance(
          [
            { x: sx, y: sy },
            { x: tx, y: ty },
          ],
          PATH_NORMALIZED_STEP
        ),
        0,
        1,
        false
      );
      lastRandomSpawnTime = timestamp;
    } else {
      return;
    }
    planes.value.push(newPlane);
  };
  const drawWaypoint = (waypoint: Waypoint) => {
    if (!ctx) return;
    ctx.save();
    ctx.translate(waypoint.x, waypoint.y);
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(waypoint.name, 24, -26);
    if (waypoint.description) {
      ctx.font = '14px italian Arial';
      ctx.fillStyle = '#9e9e9e';
      ctx.fillText(waypoint.description, -20, 2);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 7);
    ctx.stroke();
    ctx.restore();
  };
  const drawRunway = (runway: Runway) => {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.translate(runway.centerX, runway.centerY);
    ctx.rotate(runway.direction);
    ctx.strokeRect(
      -runway.length / 2,
      -runway.width / 2,
      runway.length,
      runway.width
    );
    ctx.setLineDash([]);
    const arrowLength = runway.length * 0.2;
    const arrowHeadSize = 8;
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
    const landingArrowLocalX = -runway.length / 2 - arrowLength / 2;
    ctx.beginPath();
    ctx.moveTo(landingArrowLocalX - arrowLength / 2, 0);
    ctx.lineTo(landingArrowLocalX + arrowLength / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      landingArrowLocalX + arrowLength / 2 - arrowHeadSize,
      -arrowHeadSize / 2
    );
    ctx.lineTo(landingArrowLocalX + arrowLength / 2, 0);
    ctx.lineTo(
      landingArrowLocalX + arrowLength / 2 - arrowHeadSize,
      arrowHeadSize / 2
    );
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
    const departureArrowLocalX = runway.length / 2 + arrowLength / 2;
    ctx.beginPath();
    ctx.moveTo(departureArrowLocalX - arrowLength / 2, 0);
    ctx.lineTo(departureArrowLocalX + arrowLength / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      departureArrowLocalX + arrowLength / 2 - arrowHeadSize,
      -arrowHeadSize / 2
    );
    ctx.lineTo(departureArrowLocalX + arrowLength / 2, 0);
    ctx.lineTo(
      departureArrowLocalX + arrowLength / 2 - arrowHeadSize,
      arrowHeadSize / 2
    );
    ctx.stroke();
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(runway.length / 2, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(-runway.length / 2, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  let lastTime = 0;
  const animate = (timestamp: number) => {
    if (!ctx || !canvasRef.value) return;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    planes.value.forEach((plane) => {
      if (
        !plane.isLanding &&
        plane.path &&
        plane.pathIndex < plane.path.length
      ) {
        const isBlinkingPath =
          draggedPlane.value?.id === plane.id && !!landingProjection.value;
        for (let i = plane.pathIndex; i < plane.path.length; i++) {
          if (isBlinkingPath && Date.now() % 600 < 300) continue;
          const point = plane.path[i];
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    if (landingProjection.value && ctx) {
      const { runway, plane } = landingProjection.value;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.translate(runway.landingPoint.x, runway.landingPoint.y);
      ctx.rotate(runway.landingApproachAngle);
      ctx.drawImage(
        plane.ghostImage,
        -PLANE_CONFIG.SIZE / 2,
        -PLANE_CONFIG.SIZE / 2,
        PLANE_CONFIG.SIZE,
        PLANE_CONFIG.SIZE
      );
      ctx.restore();
    }
    if (
      planes.value.length < MIN_PLANES ||
      (planes.value.length < MAX_PLANES && Math.random() < 0.005)
    )
      addPlane(timestamp);
    planes.value = planes.value.filter((p) => !p.isOffscreen);
    planes.value.forEach((plane) => {
      plane.update(deltaTime);
      plane.draw(ctx!);
    });
    waypoints.value.forEach(drawWaypoint);
    runways.value.forEach(drawRunway);
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
        rawDragPath.value = [{ x: plane.x, y: plane.y }];
        plane.path = null;
        // Reset approaching landing state when starting new path
        plane.setApproachingLanding(false);
        break;
      }
    }
  };

  // Updated handleMove function with enhanced landing detection
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
      landingProjection.value = null;

      // Reset approaching landing state
      draggedPlane.value.setApproachingLanding(false);

      if (normalizedPath.length >= 2) {
        const pathEnd = normalizedPath[normalizedPath.length - 1];
        const pathSecondToEnd = normalizedPath[normalizedPath.length - 2];
        const approachAngle = Math.atan2(
          pathEnd.y - pathSecondToEnd.y,
          pathEnd.x - pathSecondToEnd.x
        );
        for (const runway of runways.value) {
          if (
            getDistance(pathEnd, runway.landingPoint) < 60 &&
            getAngleDifference(approachAngle, runway.landingApproachAngle) <
              runway.angleTolerance
          ) {
            landingProjection.value = { runway, plane: draggedPlane.value };
            normalizedPath[normalizedPath.length - 1] = runway.landingPoint;

            // Set approaching landing state for opacity change
            draggedPlane.value.setApproachingLanding(true);
            break;
          }
        }
      }
      draggedPlane.value.path = normalizedPath;
      draggedPlane.value.pathIndex = findClosestPointIndex(
        { x: draggedPlane.value.x, y: draggedPlane.value.y },
        normalizedPath
      );
    }
  };

  // Updated handleEnd function with corrected landing logic
  const handleEnd = () => {
    if (draggedPlane.value && landingProjection.value) {
      const plane = draggedPlane.value;
      const runway = landingProjection.value.runway;

      // Set up landing target but don't start landing immediately
      plane.setLandingTarget(runway.centerX, runway.centerY);

      // Keep approaching state (0.5 opacity) but don't start actual landing yet
      plane.setApproachingLanding(true);

      // The plane will complete its path first, then start landing when path is done
    } else if (draggedPlane.value) {
      // Reset approaching state if not landing
      draggedPlane.value.setApproachingLanding(false);
    }

    draggedPlane.value = null;
    rawDragPath.value = null;
    landingProjection.value = null;
  };

  const setup = () => {
    if (!canvasRef.value) return;
    ctx = canvasRef.value.getContext('2d');
    const cvsWidth = window.innerWidth;
    const cvsHeight = window.innerHeight;
    canvasRef.value.width = cvsWidth;
    canvasRef.value.height = cvsHeight;
    planes.value = [];
    lastDepartureTime = performance.now();
    lastRandomSpawnTime = performance.now();
    waypoints.value = waypointConfigGenerator(cvsWidth, cvsHeight);
    runways.value = runwayConfigGenerator(cvsWidth, cvsHeight).map((config) =>
      createRunway(
        config.id,
        config.centerX,
        config.centerY,
        config.direction,
        config.length,
        config.width,
        config.angleTolerance
      )
    );
    addPlane(performance.now());
  };

  onMounted(() => {
    const imagePromises = planeIconUrls.map(
      (url) =>
        new Promise<{ main: HTMLImageElement; ghost: HTMLImageElement }>(
          (resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = async () => {
              const ghostImg = await createGhostImage(img);
              resolve({ main: img, ghost: ghostImg });
            };
            img.onerror = () => reject(`Failed to load image at ${url}`);
          }
        )
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
