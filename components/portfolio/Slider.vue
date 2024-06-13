<script setup lang="ts">
import type { IProjectPage } from '@/interfaces/project';
import SliderControls from '@/components/portfolio/SliderControls.vue';

const props = defineProps<{
  id: string;
  slug: string;
  pages: IProjectPage[];
}>();

const { id } = toRefs(props);
const { slug } = toRefs(props);
const { pages } = toRefs(props);
</script>

<template>
  <Swiper
    :id="id"
    :modules="[SwiperEffectCreative]"
    :slides-per-view="1"
    :loop="true"
    :effect="'creative'"
    :creative-effect="{
      prev: {
        shadow: false,
        translate: ['-20%', 0, -1],
      },
      next: {
        translate: ['100%', 0, 0],
      },
    }"
  >
    <SwiperSlide
      v-for="p in pages"
      :key="p.url"
      style="aspect-ratio: 450 / 310"
    >
      <NuxtLink :href="slug">
        <img :src="p.img" alt="project image" />
      </NuxtLink>
    </SwiperSlide>

    <SliderControls />
  </Swiper>
</template>

<style>
.swiper {
  border-radius: 6px;
  overflow: hidden;
}
.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
}
.swiper-slide img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
}
.swiper-wrapper {
  min-width: 450px;
  width: 450px;
}
/* .swiper-cards {
} */
/* .swiper-cards .swiper-slide {
} */
</style>
