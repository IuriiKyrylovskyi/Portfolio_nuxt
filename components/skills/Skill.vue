<script setup lang="ts">
import { defineInitCardPosition } from '~/helpers/defineInitCardPosition';

const props = defineProps<{
  indx: number;
  icon: string;
  name: string;
}>();

const { indx } = toRefs(props);
const { icon } = toRefs(props);
const { name } = toRefs(props);

const { left, top, zIndex } = defineInitCardPosition(indx.value + 1);

const styles = ref(
  `transform: translate(${left}%, ${top}%); z-index: ${zIndex};`
);
</script>

<template>
  <li class="skill-item flip-card relative cursor-pointer" :style="styles">
    <div class="flip-card-inner">
      <div class="flip-card-front">
        <img :src="icon" :alt="name" />
      </div>
      <div class="flip-card-back">
        {{ name }}
      </div>
    </div>
  </li>
</template>

<style scoped>
.skill-item {
  background: white;
  border: 5px solid white;
  border-radius: 4px;
  width: 120px;
  aspect-ratio: 1 / 1;

  position: relative;

  animation: slide-in 0.5s forwards;
  -webkit-animation: slide-in 0.5s forwards;

  @media (max-width: 500px) {
    flex: 1 1 22%;
    width: 22%;
  }
}

@keyframes slide-in {
  100% {
    transform: translate(0%);
    z-index: 1;
  }
}

@-webkit-keyframes slide-in {
  100% {
    -webkit-transform: translate(0%);
    z-index: 1;
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
