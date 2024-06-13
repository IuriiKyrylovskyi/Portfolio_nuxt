<script setup lang="ts">
import { projects } from '~/utils/constants/projects';

import Slider from '~/components/portfolio/Slider.vue';
</script>

<template>
  <div class="w-full">
    <ul class="w-full flex gap-[40px] flex-wrap">
      <li :key="p.title" v-for="p in projects" class="project-card">
        <Slider :pages="p.pages" :id="p.title" :slug="p.slug" />
        <NuxtLink :href="p.slug">
          <div
            class="mt-[10px] text-lg cursor-pointer hover:bg-white/10 transition ease-linear px-[10px] py-[5px] rounded"
          >
            <h5 class="text-white">{{ p.title }}</h5>
            <p class="text-white/60">{{ p.description }}</p>
          </div>
        </NuxtLink>
      </li>
      <li
        class="project-card flex flex-col gap-[10px] items-center justify-center"
      >
        <p>...adding more is in a process</p>
        <a
          class="hover:underline"
          href="https://yurii-kyrylovskyi.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          >Visit previous portfolio version?</a
        >
      </li>
    </ul>
  </div>
</template>

<style scoped>
.project-card {
  flex: 0 0 calc(50% - 20px);
  width: calc(50% - 20px);
}

@media (max-width: 500px) {
  .project-card {
    flex: 0 0 100%;
    width: 100%;
  }
}
</style>
