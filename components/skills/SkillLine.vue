<script setup lang="ts">
const props = defineProps<{
  icon: string;
  name: string;
}>();

const { icon } = toRefs(props);
const { name } = toRefs(props);
</script>

<template>
  <li
    class="flex justify-center items-center gap-[10px] my-[10px] bg-white py-[2px] px-[10px] mx-[5px] rounded"
  >
    <div class="w-[32px]">
      <img :src="icon" :alt="name" />
    </div>
    <p class="text-black text-2xl">
      {{ name }}
    </p>
  </li>
</template>
