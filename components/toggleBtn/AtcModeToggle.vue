<template>
  <div
    class="relative inline-block w-14 h-8 transition duration-200 ease-linear rounded-full"
  >
    <input
      type="checkbox"
      id="theme-toggle"
      class="hidden toggle-switch-input"
      :checked="isDark"
      @change="toggleTheme"
    />
    <label
      for="theme-toggle"
      class="flex items-center justify-between cursor-pointer w-full h-full rounded-full toggle-switch-bg bg-gray-300"
    >
      <div class="w-5 h-5 ml-1.5 flex items-center justify-center">
        <!-- Sun icon SVG -->
        <svg
          v-if="!isDark"
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-orange-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm5.636 2.364a.75.75 0 0 1 0 1.06L16.06 7.189a.75.75 0 1 1-1.06-1.06l1.586-1.586a.75.75 0 0 1 1.06 0ZM7.189 15.439a.75.75 0 0 1-1.06-1.06l-1.586-1.586a.75.75 0 0 1 1.06-1.06l1.586 1.586a.75.75 0 0 1 0 1.06Zm-.75-7.5a.75.75 0 0 1 0-1.06L7.189 5.05a.75.75 0 0 1 1.06 1.06l-1.586 1.586a.75.75 0 0 1-1.06 0ZM19.25 12a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75Zm-5.25 6.439a.75.75 0 0 1-1.06 0l-1.586-1.586a.75.75 0 1 1 1.06-1.06l1.586 1.586a.75.75 0 0 1 0 1.06Zm-9.14-5.25a.75.75 0 0 1 0 1.06L5.05 16.06a.75.75 0 0 1-1.06-1.06l1.586-1.586a.75.75 0 0 1 1.06 0ZM12 18.25a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75ZM6.439 18.939a.75.75 0 0 1 0-1.06l1.586-1.586a.75.75 0 1 1 1.06 1.06l-1.586 1.586a.75.75 0 0 1-1.06 0ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
          />
        </svg>
        <!-- Moon icon SVG -->
        <svg
          v-if="isDark"
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-blue-300"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2.75a9.25 9.25 0 1 0 9.25 9.25A9.25 9.25 0 0 0 12 2.75ZM1.75 12a10.25 10.25 0 0 1 18.067-6.288A8.25 8.25 0 0 0 11.25 20.25a8.25 8.25 0 0 1-9.567-8.288Z"
          />
        </svg>
      </div>
      <span
        class="block w-6 h-6 mr-1.5 rounded-full toggle-switch-circle bg-gray-50 dark:bg-slate-900 shadow-md"
      ></span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

const isDark = ref(false);

const toggleTheme = (): void => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>

<style scoped>
/*
 * This CSS is a workaround for Tailwind's limitations
 * for creating the animated toggle effect.
 */
.toggle-switch-input:checked + .toggle-switch-bg .toggle-switch-circle {
  transform: translateX(1.5rem);
}

.dark .toggle-switch-bg {
  background-color: #6b7280;
}

.dark .toggle-switch-circle {
  background-color: #d1d5db;
}

.toggle-switch-bg {
  transition: background-color 0.3s ease;
}

.toggle-switch-circle {
  transition: transform 0.3s ease, background-color 0.3s ease;
}
</style>
