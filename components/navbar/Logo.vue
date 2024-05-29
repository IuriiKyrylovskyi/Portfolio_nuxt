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
      <span>K</span>
      <img src="@/assets/logo-black.jpeg" alt="Yurii Kyrylovskyi logo" />
      <span>Y</span>
    </RouterLink>
  </div>
</template>

<style>
span {
  color: #1a5170;
}
</style>
