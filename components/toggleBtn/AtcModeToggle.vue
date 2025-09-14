<script lang="ts" setup>
const { isTraffic, toggleTraffic } = useTraffic();
</script>

<template>
  <div
    class="relative inline-block w-14 h-8 transition duration-200 ease-linear rounded-full"
  >
    <input
      type="checkbox"
      id="theme-toggle"
      class="hidden toggle-switch-input"
      :checked="isTraffic"
      @change="toggleTraffic"
    />
    <label
      for="theme-toggle"
      class="flex items-center justify-between cursor-pointer w-full h-full rounded-full toggle-switch-bg transition-all"
    >
      <nuxt-img
        :src="`${isTraffic ? '/radars/radar-glow.png' : '/radars/radar.png'}`"
        :placeholder="[30, 30]"
        width="40"
        height="40"
        class="rounded"
      />
    </label>
  </div>
</template>

<style scoped></style>
