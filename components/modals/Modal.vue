<script setup lang="ts">
import { ref } from 'vue';
import { RouteNames, Routes } from '@/interfaces/global';

import type { IModalItem } from '@/components/contactMe/ContactMe.vue';

const emit = defineEmits<{
  (e: 'handleCloseModal'): void;
}>();

const handleCloseModal = () => {
  emit('handleCloseModal');
};

const props = defineProps<{
  modalItem: IModalItem | null;
}>();

const { modalItem } = toRefs(props);

const open = ref(false);
const errorClass = ref(modalItem?.value?.error ? 'error' : '');

watchEffect(() => {
  if (modalItem?.value?.message) {
    document.body.classList.add('overflow-y-hidden');
    open.value = true;
  }
});

const handleClose = () => {
  open.value = false;
  handleCloseModal();
};
</script>

<template>
  <Transition name="modal">
    <Teleport to="body">
      <div v-if="open" class="modal">
        <div
          class="relative min-w-[300px] flex flex-col gap-[40px] items-center bg-white p-[44px] text-black text-center text-2xl rounded"
        >
          <img
            v-if="modalItem?.error"
            src="@/assets/images/email-failed.png"
            alt="error icon"
            class="max-w-[170px]"
          />
          <img
            v-if="!modalItem?.error"
            src="@/assets/images/email-success.png"
            alt="success icon"
            class="max-w-[170px]"
          />
          <p :class="errorClass">{{ modalItem?.message }}</p>
          <div class="flex gap-[16px]">
            <NuxtLink :to="Routes.HOME" class="button">{{
              RouteNames.HOME
            }}</NuxtLink>
            <button class="button" @click="handleClose">
              One more message?
            </button>
          </div>

          <button
            class="close-modal absolute top-[-32px] right-[-32px]"
            @click="handleClose"
          >
            <img src="@/assets/images/close.svg" alt="close button" />
          </button>
        </div>
      </div>
    </Teleport>
  </Transition>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  background: rgba(0, 0, 52, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  color: #f10404;
}

.button {
  border: 2px solid #ffeb3b;
  background: #ffeb3b;
  border-radius: 8px;
  padding: 3px 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

@media (hover: hover) {
  .button:hover {
    border: 2px solid #0073ff;
    color: #0073ff;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  }
}

.close-modal {
  @media (max-width: 500px) {
    right: -2px;
    top: -36px;
  }
}
</style>
