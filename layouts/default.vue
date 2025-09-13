<script setup lang="ts">
import HeaderNavbar from '@/components/navbar/HeaderNavbar.vue';
import PageContainer from '@/components/common/PageContainer.vue';
import AirTrafficCanvas from '~/components/airTrafficCanvas/AirTrafficCanvas.vue';
import AirTrafficCanvasV2 from '~/components/airTrafficCanvas/AirTrafficCanvasV2.vue';
</script>

<template>
  <canvas ref="canvasRef" />
  <!-- <AirTrafficCanvas /> -->
  <AirTrafficCanvasV2 />
  <HeaderNavbar />

  <main class="min-h-screen pt-[90px] flex items-center">
    <PageContainer>
      <NuxtPage />
    </PageContainer>
  </main>

  <Footer />
</template>
