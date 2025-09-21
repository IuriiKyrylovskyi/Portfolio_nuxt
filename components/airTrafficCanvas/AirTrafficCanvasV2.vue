<script setup lang="ts">
import { ref } from 'vue';
import {
  useAirTraffic,
  type AirTrafficOptions,
} from '~/composables/useAirTraffic';

// 1. Import the data configurations
import { defaultPlaneIconUrls } from '~/data/planes';
import { getRunwayConfigs } from '~/data/runways';
import { getWaypointConfigs } from '~/data/waypoints';

// 2. Create a ref for the canvas element
const canvasRef = ref<HTMLCanvasElement | null>(null);

// 3. Assemble the configuration object, passing the functions directly
const simulationOptions: AirTrafficOptions = {
  planeIconUrls: defaultPlaneIconUrls,
  runways: getRunwayConfigs, // Pass the function itself
  waypoints: getWaypointConfigs, // Pass the function itself
};

// 4. Activate the composable with the canvas ref and options
useAirTraffic(canvasRef, simulationOptions);
</script>

<template>
  <nuxt-img
    src="/rws/007.png"
    format="avif"
    alt=""
    cover
    class="fullscreen-img object-cover"
    loading="lazy"
  />
  <canvas ref="canvasRef" />
</template>

<style>
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
}

.fullscreen-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  opacity: 0.5;
}
</style>
