<script setup lang="ts">
import { skills } from '@/utils/constants/skills';
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <ul class="flex gap-2 flex-wrap items-center justify-center shadow-2xl">
      <li v-for="s in skills" class="skill-item relative cursor-pointer">
        <p class="absolute">
          <span
            class="py-1 px-2 bg-white border-1 rounded text-center shadow-md"
            >{{ s.name }}</span
          >
        </p>
        <img :src="s.icon" :alt="s.name" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.skill-item {
  background: white;
  border: 5px solid white;
  border-radius: 4px;
}
.skill-item img {
  /* position: absolute; */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: contain;

  max-width: 120px;
  max-height: 120px;
}
p {
  opacity: 0;
  transition: all 0.3s linear;
  width: 100%;
  height: 100%;
  z-index: 1;

  color: white;
}
p:hover {
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
