<script setup lang="ts">
import Links from './Links.vue';
import Slider from './Slider.vue';
</script>

<template>
  <div class="flex flex-col items-center gap-4 md:gap-8 my-[32px]">
    <div class="text-xl text-white font-bold">
      <p>
        Today, the largest war in Europe since World War II has been unfolding.
        Once again the world has to stand against evil, against terror, against
        genocide. Ukrainians are the ones on the battlefield today, but in a
        modern globalized world, everyone already is or will be affected by this
        war. And if the terrorist russian state would not be stopped now, the
        whole human history may take a darker path for the decades to come.
      </p>
    </div>
    <div class="ml-[-2px]">
      <Slider />
    </div>

    <Links />

    <p class="my-[20px] text-xl text-left w-full">
      <a
        class="hover:text-white transition-all"
        href="https://war.ukraine.ua/the-histrory-of-russian-aggression-in-ukraine/"
        target="_blank"
        rel="noopener noreferrer"
      >
        russiaʼS INVASION TIMELINE</a
      >
    </p>
  </div>
</template>
