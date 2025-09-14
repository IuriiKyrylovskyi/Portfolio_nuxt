<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { Routes } from '@/interfaces/global';
</script>

<template>
  <div className="flex flex-[0_0_90px] justify-center min-w-[90px] w-full">
    <RouterLink
      :to="Routes.HOME"
      class="size-16 rounded-md p-1 flex gap-1 items-center justify-center w-full"
    >
      <span>K</span>
      <nuxt-img
        src="./logo/logo-transparent.png"
        alt="Yurii Kyrylovskyi logo"
        :placeholder="[56, 56]"
        width="56"
        height="56"
        fill
        class="object-contain"
        loading="lazy"
        sizes="sm:56px lg:56px"
      />
      <span>Y</span>
    </RouterLink>
  </div>
</template>

<style>
span {
  color: #1a5170;
}
</style>
