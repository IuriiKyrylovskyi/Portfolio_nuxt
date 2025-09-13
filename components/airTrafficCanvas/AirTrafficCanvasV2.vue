<script setup lang="ts">
import { ref } from 'vue';
import { useAirTraffic } from '~/composables/useAirTraffic';

// Create a ref for the canvas element
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Activate the air traffic controller logic, passing it the canvas ref
useAirTraffic(canvasRef);
</script>

<template>
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
}
</style>
