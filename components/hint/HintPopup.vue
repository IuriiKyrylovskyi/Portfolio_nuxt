<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Define the state for the hint popup
interface HintState {
  isVisible: boolean;
  message: string;
  src?: string;
  title?: string;
  duration?: number; // in milliseconds
  customClass?: string;
  showCloseButton?: boolean;
}

const { isTraffic } = useTraffic();
const { showHint } = useHint();

// Use a global state to manage the hint's visibility and content
const hintState = useState<HintState>('globalHintPopup', () => ({
  isVisible: false,
  message: '',
  title: '',
  src: '',
  duration: 5000, // Default 5 seconds
  customClass: '',
  showCloseButton: false,
}));

// Local refs for easier access in template and reactivity
const isVisible = ref(false);
const hintMessage = ref('');
const hintTitle = ref('');
const hintIconUrl = ref('');
const hintDuration = ref(5000);
const customClass = ref('');
const showCloseButton = ref(false);

let timeoutId: NodeJS.Timeout | null = null; // For clearing the auto-hide timeout

const updateHint = () => {
  // Clear any existing timeout
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  isVisible.value = hintState.value.isVisible;
  hintMessage.value = hintState.value.message;
  hintTitle.value = hintState.value.title || '';
  hintIconUrl.value = hintState.value.src || '';
  hintDuration.value = hintState.value.duration || 5000;
  customClass.value = hintState.value.customClass || '';
  showCloseButton.value = hintState.value.showCloseButton || false;

  if (isVisible.value && hintDuration.value > 0) {
    timeoutId = setTimeout(() => {
      closeHint();
    }, hintDuration.value);
  }
};

const closeHint = () => {
  hintState.value.isVisible = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

// Watch for changes in the global state to update the component
watch(hintState, updateHint, { deep: true, immediate: true });
watch(
  isTraffic,
  (newVal) => {
    if (!newVal) return;

    showHint({
      message: 'Set a traffic queue to NATS via JANJO',
      src: './atc/atc.png',
      showCloseButton: true,
    });
  },
  { deep: true, immediate: true }
);

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<template>
  <Transition name="hint-fade">
    <div
      v-if="isVisible"
      class="fixed top-4 right-4 bg-gray-800 text-white p-1 pr-4 rounded-lg shadow-lg max-w-[420px] z-500 border-2 border-sky-600"
      :class="customClass"
    >
      <div v-if="hintTitle" class="font-bold mb-1">{{ hintTitle }}</div>
      <div class="flex items-center gap-2">
        <img
          v-if="hintIconUrl"
          :src="hintIconUrl"
          alt="atc"
          class="w-20 h-20 object-contain flex-shrink-0"
        />
        <p class="color-white text-lg">{{ hintMessage }}</p>
      </div>
      <button
        v-if="showCloseButton"
        @click="closeHint"
        class="absolute top-1 right-2 text-gray-400 hover:text-white"
      >
        &times;
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
