<script setup lang="ts">
const props = defineProps<{
  isCardsView: boolean;
}>();

const { isCardsView } = toRefs(props);

const emit = defineEmits<{
  (e: 'handleClick'): void;
}>();

const handleClick = () => {
  emit('handleClick');
};
</script>

<template>
  <div class="w-full flex justify-end items-center mt-[30px]">
    <div class="flex gap-[10px]">
      <span
        class="cursor-pointer"
        :class="isCardsView ? 'active' : ''"
        @click="handleClick"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="32px"
          viewBox="0 -960 960 960"
          width="32px"
          fill="#969696"
        >
          <path
            d="M120-520v-320h320v320H120Zm0 400v-320h320v320H120Zm400-400v-320h320v320H520Zm0 400v-320h320v320H520ZM200-600h160v-160H200v160Zm400 0h160v-160H600v160Zm0 400h160v-160H600v160Zm-400 0h160v-160H200v160Zm400-400Zm0 240Zm-240 0Zm0-240Z"
          />
        </svg>
      </span>
      <span
        class="cursor-pointer"
        :class="!isCardsView ? 'active' : ''"
        @click="handleClick"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="32px"
          viewBox="0 -960 960 960"
          width="32px"
          fill="#969696"
        >
          <path
            d="M360-240h440v-107H360v107ZM160-613h120v-107H160v107Zm0 187h120v-107H160v107Zm0 186h120v-107H160v107Zm200-186h440v-107H360v107Zm0-187h440v-107H360v107ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z"
          />
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.active svg {
  fill: #e8eaed;
}
</style>
