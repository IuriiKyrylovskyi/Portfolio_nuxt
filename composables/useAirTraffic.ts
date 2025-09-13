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
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrameId: number;
  // We will store all loaded images in this array
  const loadedPlaneImages: HTMLImageElement[] = [];

  const getRandomColor = () => {
    /* ... (no change) */
    const colors = [
      '#ff4d4d',
      '#ffa64d',
      '#ffff4d',
      '#4dff4d',
      '#4dffff',
      '#4d4dff',
      '#ff4dff',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const getDistance = (p1: Point, p2: Point) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

  // --- MODIFIED CORE LOGIC ---
  const addPlane = () => {
    if (
      planes.value.length < MAX_PLANES &&
      canvasRef.value &&
      loadedPlaneImages.length > 0
    ) {
      // Pick a random image from our loaded assets
      const randomImage =
        loadedPlaneImages[Math.floor(Math.random() * loadedPlaneImages.length)];
      // Pass the image to the new Plane instance
      planes.value.push(
        new Plane(canvasRef.value.width, canvasRef.value.height, randomImage)
      );
    }
  };

  const checkConflicts = () => {
    /* ... (no change) */
    planes.value.forEach((p) => (p.warning = null));
    for (let i = 0; i < planes.value.length; i++) {
      for (let j = i + 1; j < planes.value.length; j++) {
        const p1 = planes.value[i];
        const p2 = planes.value[j];
        if (getDistance(p1, p2) < PLANE_CONFIG.CONFLICT_DISTANCE) {
          if (!p1.warning) p1.warning = { color: getRandomColor() };
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

    if (
      planes.value.length < MIN_PLANES ||
      (planes.value.length < MAX_PLANES && Math.random() < 0.005)
    ) {
      addPlane();
    }

    planes.value = planes.value.filter((p) => !p.isOffscreen);
    checkConflicts();
    planes.value.forEach((plane) => {
      plane.update(deltaTime);
      // Call draw without the image, as the plane now holds its own
      plane.draw(ctx!);
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  // --- EVENT HANDLERS (no changes) ---
  const getEventPoint = (e: MouseEvent | TouchEvent): Point => {
    /* ... */
    const rect = canvasRef.value!.getBoundingClientRect();
    const pos = 'touches' in e ? e.touches[0] : e;
    return { x: pos.clientX - rect.left, y: pos.clientY - rect.top };
  };
  const handleStart = (e: MouseEvent | TouchEvent) => {
    /* ... */
    e.preventDefault();
    const point = getEventPoint(e);
    for (let i = planes.value.length - 1; i >= 0; i--) {
      const plane = planes.value[i];
      if (plane.isPointInControlZone(point)) {
        draggedPlane.value = plane;
        draggedPlane.value.isDragging = true;
        break;
      }
    }
  };
  const handleMove = (e: MouseEvent | TouchEvent) => {
    /* ... */
    if (!draggedPlane.value) return;
    e.preventDefault();
    const point = getEventPoint(e);
    const newAngle = Math.atan2(
      point.y - draggedPlane.value.y,
      point.x - draggedPlane.value.x
    );
    draggedPlane.value.angle = newAngle;
    draggedPlane.value.vx = Math.cos(newAngle) * PLANE_CONFIG.SPEED;
    draggedPlane.value.vy = Math.sin(newAngle) * PLANE_CONFIG.SPEED;
  };
  const handleEnd = () => {
    /* ... */
    if (draggedPlane.value) {
      draggedPlane.value.isDragging = false;
      draggedPlane.value = null;
    }
  };

  // --- MODIFIED LIFECYCLE HOOKS ---
  const setup = () => {
    /* ... (no change) */
    if (!canvasRef.value) return;
    ctx = canvasRef.value.getContext('2d');
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
    planes.value = [];
    addPlane();
  };

  onMounted(() => {
    // Create a promise for each image to load
    const imagePromises = planeIconUrls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Failed to load image at ${url}`);
      });
    });

    // Wait for all images to load before starting the animation
    Promise.all(imagePromises)
      .then((images) => {
        // All images are loaded, store them and start the simulation
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
      .catch((error) => {
        console.error('Could not load plane images:', error);
      });
  });

  onUnmounted(() => {
    /* ... (no change) */
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
