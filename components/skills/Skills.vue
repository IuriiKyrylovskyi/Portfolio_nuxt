<script setup lang="ts">
import { skills } from '@/utils/constants/skills';
import Skill from './Skill.vue';
import SkillLine from './SkillLine.vue';

const isCardsView = ref(true);

const handleClick = () => {
  isCardsView.value = !isCardsView.value;
};
</script>

<template>
  <div>
    <SkillsViewToggle @handleClick="handleClick" :isCardsView="isCardsView" />
    <div class="w-full flex items-center justify-center">
      <ul class="flex gap-2 flex-wrap items-center justify-center py-[50px]">
        <Skill
          v-if="isCardsView"
          v-for="(s, i) in skills"
          :indx="i"
          :name="s.name"
          :icon="s.icon"
        />
        <SkillLine
          v-if="!isCardsView"
          v-for="(s, i) in skills"
          :indx="i"
          :name="s.name"
          :icon="s.icon"
        />
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
