<script setup lang="ts">
import { toRefs } from 'vue'

import SocialIcon from './SocialIcon.vue'

const props = defineProps<{
  href: string
  target: string
  rel: string
  iconName: string
}>()

const { href } = toRefs(props)
const { target } = toRefs(props)
const { rel } = toRefs(props)
const { iconName } = toRefs(props)
</script>

<template>
  <div
    class="flex-[0_0_44px] flex items-center justify-center w-11 h-11 bg-white rounded-full transition linear duration-300 relative hover:scale-[1.05] hover:top-0.5"
  >
    <a :href="href" class="flex items-center size-10" :target="target" :rel="rel">
      <SocialIcon :iconName="iconName" />
    </a>
  </div>
</template>

<style scoped>
nav a.router-link-exact-active {
  color: #ffffff;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}
</style>
