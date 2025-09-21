<script setup lang="ts">
onMounted(() => {
  document.body.classList.add('no-scroll');
});

onUnmounted(() => {
  document.body.classList.remove('no-scroll');
});
</script>

<template>
  <h1>Play page</h1>
</template>
