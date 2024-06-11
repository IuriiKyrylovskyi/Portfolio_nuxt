<script setup lang="ts">
import type { IProject } from '~/interfaces/project';
import SliderControls from '@/components/portfolio/SliderControls.vue';

const props = defineProps<{ item: IProject }>();

const { item } = toRefs(props);
</script>

<template>
  <Swiper
    id="project"
    :modules="[SwiperAutoplay, SwiperEffectCreative]"
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
    :autoplay="{
      delay: 3000,
      disableOnInteraction: true,
    }"
  >
    <SwiperSlide
      v-for="(s, i) in item.pages"
      :key="i"
      style="aspect-ratio: 670 / 445"
    >
      <a :href="s.url" target="_blank" rel="noopener noreferrer">
        <img :src="s.img" alt="war in Ukraine" />
      </a>
    </SwiperSlide>

    <SliderControls />
  </Swiper>
</template>

<style>
#project .swiper {
  border-radius: 6px;
  overflow: hidden;

  margin: 0 auto;
}
#project .swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
}
#project .swiper-slide img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
}
#project .swiper-wrapper {
  min-width: 1000px;
  width: 1000px;
}

@media (max-width: 700px) {
  #project .swiper-wrapper {
    min-width: calc(100vw - 32px);
    width: calc(100vw - 32px);
  }
}
</style>
