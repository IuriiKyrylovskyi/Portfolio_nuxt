<script setup lang="ts">
import HeaderNavbar from '@/components/navbar/HeaderNavbar.vue';
import PageContainer from '@/components/common/PageContainer.vue';
import AirTrafficCanvasV2 from '~/components/airTrafficCanvas/AirTrafficCanvasV2.vue';
import HintPopup from '~/components/hint/HintPopup.vue';
import { Routes } from '~/interfaces/global';

const { isTraffic } = useTraffic();

const route = useRoute();

const isPlay = computed(() => route.path === Routes.PLAY);

watch(
  () => isPlay,
  (newPath) => {
    console.log(route.path);
  }
);
</script>

<template>
  <AirTrafficCanvasV2 v-if="isTraffic || isPlay" />
  <HeaderNavbar />

  <main class="min-h-screen pt-[90px] flex items-center">
    <PageContainer>
      <NuxtPage />
    </PageContainer>
  </main>

  <Footer />

  <HintPopup />
</template>
