import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { Plane, PLANE_CONFIG, type Point } from '~/interfaces/traffic';

const MAX_PLANES = 7;
const MIN_PLANES = 1;

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

export function useAirTraffic(canvasRef: Ref<HTMLCanvasElement | null>) {
  const planes = ref<Plane[]>([]);
  const draggedPlane = ref<Plane | null>(null);
  // NEW: State to hold the start and end points of the line being drawn
  const dragPath = ref<{ start: Point; end: Point } | null>(null);

  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrameId: number;
  const loadedPlaneImages: HTMLImageElement[] = [];

  const getDistance = (p1: Point, p2: Point) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  const addPlane = () => {
    if (
      planes.value.length < MAX_PLANES &&
      canvasRef.value &&
      loadedPlaneImages.length > 0
    ) {
      const randomImage =
        loadedPlaneImages[Math.floor(Math.random() * loadedPlaneImages.length)];
      planes.value.push(
        new Plane(canvasRef.value.width, canvasRef.value.height, randomImage)
      );
    }
  };
  const checkConflicts = () => {
    planes.value.forEach((p) => (p.warning = null));
    for (let i = 0; i < planes.value.length; i++) {
      for (let j = i + 1; j < planes.value.length; j++) {
        const p1 = planes.value[i];
        const p2 = planes.value[j];
        if (getDistance(p1, p2) < PLANE_CONFIG.CONFLICT_DISTANCE) {
          if (!p1.warning) p1.warning = { color: `#ff8f00` }; // Changed to a consistent amber color
          p2.warning = p1.warning;
        }
      }
    }
  };

  let lastTime = 0;
  const animate = (timestamp: number) => {
    if (!ctx || !canvasRef.value) return;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    // --- NEW: Draw the path line if it exists ---
    if (dragPath.value) {
      ctx.beginPath();
      ctx.moveTo(dragPath.value.start.x, dragPath.value.start.y);
      ctx.lineTo(dragPath.value.end.x, dragPath.value.end.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 10]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash for other drawings
    }

    if (
      planes.value.length < MIN_PLANES ||
      (planes.value.length < MAX_PLANES && Math.random() < 0.005)
    )
      addPlane();
    planes.value = planes.value.filter((p) => !p.isOffscreen);
    checkConflicts();
    planes.value.forEach((plane) => {
      plane.update(deltaTime);
      plane.draw(ctx!);
    });
    animationFrameId = requestAnimationFrame(animate);
  };

  // --- REBUILT EVENT HANDLERS ---
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
        plane.isPathPlanning = true; // Pause the plane's movement
        draggedPlane.value = plane;
        // Start drawing the path from the plane's center
        dragPath.value = { start: { x: plane.x, y: plane.y }, end: point };
        break;
      }
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!draggedPlane.value || !dragPath.value) return;
    e.preventDefault();
    const point = getEventPoint(e);
    // Update the end of the path to the current cursor position
    dragPath.value.end = point;
  };

  const handleEnd = () => {
    if (!draggedPlane.value || !dragPath.value) return;

    // Only set new path if the drawn line is longer than a few pixels
    if (getDistance(dragPath.value.start, dragPath.value.end) > 10) {
      const newAngle = Math.atan2(
        dragPath.value.end.y - dragPath.value.start.y,
        dragPath.value.end.x - dragPath.value.start.x
      );
      draggedPlane.value.angle = newAngle;
      draggedPlane.value.vx = Math.cos(newAngle) * PLANE_CONFIG.SPEED;
      draggedPlane.value.vy = Math.sin(newAngle) * PLANE_CONFIG.SPEED;
    }

    draggedPlane.value.isPathPlanning = false; // Unpause the plane

    // Clean up state
    draggedPlane.value = null;
    dragPath.value = null;
  };

  // --- LIFECYCLE HOOKS (no change to logic, just for context) ---
  const setup = () => {
    if (!canvasRef.value) return;
    ctx = canvasRef.value.getContext('2d');
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
    planes.value = [];
    addPlane();
  };
  onMounted(() => {
    /* ... */
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
    /* ... */
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
