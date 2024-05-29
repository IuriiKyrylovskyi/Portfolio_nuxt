<script setup lang="ts">
import { toRefs } from 'vue'

import { IconNames } from '@/interfaces/navbar'
import IconGithub from '../icons/IconGithub.vue'
import IconGmail from '../icons/IconGmail.vue'
import IconViber from '../icons/IconViber.vue'
import IconWhatsApp from '../icons/IconWhatsApp.vue'
import IconLinkedin from '../icons/IconLinkedin.vue'
import IconTelegram from '../icons/IconTelegram.vue'

const props = defineProps<{
  iconName: string
}>()

const { iconName } = toRefs(props)
</script>

<template>
  <IconGithub v-if="iconName === IconNames.GIT" />
  <IconGmail v-if="iconName === IconNames.GMAIL" />
  <IconLinkedin v-if="iconName === IconNames.LINKEDIN" />
  <IconWhatsApp v-if="iconName === IconNames.WHATSAPP" />
  <IconViber v-if="iconName === IconNames.VIBER" />
  <IconTelegram v-if="iconName === IconNames.TELEGRAM" />
</template>
