<script setup lang="ts">
import { ref } from 'vue';

import { IconNames } from '@/interfaces/navbar';

import SocialLink from './SocialLink.vue';
import { toRefs } from 'vue';

const props = defineProps<{
  isColumn?: boolean;
}>();

const { isColumn } = toRefs(props);

const socialLinks = ref([
  {
    href: 'https://github.com/IuriiKyrylovskyi',
    target: '_blank',
    rel: 'noreferrer',
    iconName: IconNames.GIT,
  },
  {
    href: 'mailto:iurii712@gmail.com',
    target: '',
    rel: '',
    iconName: IconNames.GMAIL,
  },
  {
    href: 'https://www.linkedin.com/in/iurii-kyrylovskyi',
    target: '_blank',
    rel: 'noreferrer',
    iconName: IconNames.LINKEDIN,
  },
  {
    href: 'viber://chat?number=%2B380662053544',
    target: '',
    rel: '',
    iconName: IconNames.VIBER,
  },
  {
    href: 'https://t.me/iurii712',
    target: '',
    rel: '',
    iconName: IconNames.TELEGRAM,
  },
  {
    href: 'https://api.whatsapp.com/send?phone=380662053544',
    target: '_blank',
    rel: 'noreferrer',
    iconName: IconNames.WHATSAPP,
  },
]);

const wrapClass = ref(
  isColumn.value
    ? 'social-links hidden sm:flex sm:flex-col sm:gap-6'
    : 'social-links justify-center flex gap-4 flex-wrap'
);
</script>

<template>
  <div :class="wrapClass">
    <SocialLink
      v-for="s in socialLinks"
      :key="s.href"
      :href="s.href"
      :target="s.target"
      :rel="s.rel"
      :iconName="s.iconName"
    />
  </div>
</template>

<style>
.social-links svg {
  max-width: 40px;
  max-height: 40px;
}
</style>
