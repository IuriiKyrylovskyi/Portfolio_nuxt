<script setup lang="ts">
import { skills } from '@/utils/constants/skills';
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <ul
      class="flex gap-2 flex-wrap items-center justify-center shadow-2xl py-[50px]"
    >
      <li
        v-for="s in skills"
        class="skill-item flip-card relative cursor-pointer"
      >
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img :src="s.icon" :alt="s.name" />
          </div>
          <div class="flip-card-back">
            {{ s.name }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.skill-item {
  background: white;
  border: 5px solid white;
  border-radius: 4px;
  width: 120px;
  aspect-ratio: 1 / 1;

  position: relative;

  @media (max-width: 500px) {
    flex: 1 1 22%;
    width: 22%;
  }
}
.skill-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: contain;
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

.flip-card {
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

@media (hover: hover) {
  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
}
</style>
