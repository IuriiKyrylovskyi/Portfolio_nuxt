<script setup>
import LogoVideo from '@/components/navbar/LogoVideo.vue';
import Socials from '@/components/navbar/Socials.vue';
import MadeWith from '@/components/footer/MadeWith.vue';
</script>

<template>
  <footer class="flex flex-col items-center gap-8 p-6 mt-10">
    <Socials />
    <MadeWith />
    <LogoVideo />
  </footer>
</template>
