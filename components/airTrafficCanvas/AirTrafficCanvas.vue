<template>
  <canvas id="airTrafficCanvas" class="air-traffic-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Simulation } from '~/helpers/simulation';

let simulation: Simulation | null = null;

onMounted(() => {
  simulation = new Simulation('airTrafficCanvas');
  simulation.start();
});

onUnmounted(() => {
  if (simulation) {
    simulation.stop();
  }
});
</script>

<style scoped>
.air-traffic-canvas {
  position: absolute; /* Or relative, depending on your layout */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* z-index: -1; Place it behind other content if it's a background effect */
}
</style>
