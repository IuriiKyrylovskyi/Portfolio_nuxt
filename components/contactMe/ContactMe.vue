<script setup lang="ts">
import Socials from '../navbar/Socials.vue';
import ContactForm from './ContactForm.vue';
import Modal from '@/components/modals/Modal.vue';

export interface IModalItem {
  message: string;
  isError: boolean;
}

const modalItem = ref<IModalItem | null>(null);

const handleModalResponse = (item: IModalItem) => {
  document.body.classList.add('overflow-y-hidden');
  modalItem.value = item;
};

const handleCloseModal = () => {
  document.body.classList.remove('overflow-y-hidden');
  modalItem.value = null;
};
</script>

<template>
  <div class="w-full flex items-center justify-between sm:gap-6">
    <div class="h-full lg:h-full lg:w-[100px] relative sm:p-4">
      <Socials :isColumn="true" />
    </div>
    <div
      class="lg:h-full lg:w-2/3 text-2xl text-white md:text-xl font-bold flex flex-col gap-6 mt-10"
    >
      <ContactForm @handleModalResponse="handleModalResponse" />

      <Modal :modalItem="modalItem" @handleCloseModal="handleCloseModal" />
    </div>
  </div>
</template>
