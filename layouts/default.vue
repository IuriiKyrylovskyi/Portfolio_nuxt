<script setup lang="ts">
import HeaderNavbar from '@/components/navbar/HeaderNavbar.vue';
import PageContainer from '@/components/common/PageContainer.vue';
</script>

<template>
  <HeaderNavbar />

  <main class="min-h-screen pt-[90px] flex items-center">
    <PageContainer>
      <NuxtPage />
    </PageContainer>
  </main>

  <Footer />
</template>
