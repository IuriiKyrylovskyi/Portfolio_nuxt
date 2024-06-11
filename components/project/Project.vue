<script setup lang="ts">
import Slider from '~/components/project/Slider.vue';
import type { IProject } from '~/interfaces/project';
import { projects } from '~/utils/constants/projects';

const route = useRoute();

const defineProject = () => {
  return projects.find((p) =>
    p.slug.includes(route.params.slug as string)
  ) as IProject;
};

const project = ref(defineProject());
</script>

<template>
  <div class="w-full flex flex-col items-center gap-4 md:gap-8 my-[32px]">
    <div class="ml-[-2px]">
      <Slider :item="project" />

      <div
        class="flex gap-[12px] flex-wrap bg-white/10 px-[10px] py-[5px] rounded text-lg my-[10px] leading-[1.1]"
      >
        <p v-for="tech in project.stack" :key="project.slug + tech">
          {{ tech }}
        </p>
      </div>
    </div>

    <div class="text-2xl text-white font-bold w-full">
      <p>
        {{ project.about }}
      </p>
    </div>
  </div>
</template>
