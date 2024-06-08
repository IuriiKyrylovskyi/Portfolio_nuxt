<script setup lang="ts">
const slides = ref([
  './help/01.png',
  './help/02.png',
  './help/03.png',
  './help/04.png',
  './help/05.png',
]);
</script>

<template>
  <Swiper
    id="help-slider"
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
      v-for="(s, i) in slides"
      :key="i"
      style="aspect-ratio: 670 / 445"
    >
      <img :src="s" alt="war in Ukran" />
    </SwiperSlide>
  </Swiper>
</template>

<style>
#help-slider .swiper {
  border-radius: 6px;
  overflow: hidden;
}
#help-slider .swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
}
#help-slider .swiper-slide img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
}
#help-slider .swiper-wrapper {
  min-width: 670px;
  width: 670px;
}

@media (max-width: 700px) {
  #help-slider .swiper-wrapper {
    min-width: calc(100vw - 32px);
    width: calc(100vw - 32px);
  }
}
</style>
