<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { Routes } from '@/interfaces/global'
</script>

<template>
  <div className="flex flex-[0_0_90px] justify-center">
    <RouterLink
      :to="Routes.HOME"
      class="size-16 rounded-md p-1 flex gap-1 items-center justify-center"
    >
      <video loop autoplay muted>
        <source src="@/assets/ky-logo-video-black.mp4" type="video/mp4" />
      </video>
    </RouterLink>
  </div>
</template>
