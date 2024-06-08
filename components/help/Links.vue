<script setup lang="ts">
const links = [
  {
    name: 'come back alive',
    link: 'https://savelife.in.ua/en/donate-en/#donate-a',
  },
  {
    name: 'Charity Фонд Андрія Хливнюка',
    link: 'https://send.monobank.ua/jar/gERGfd4xF',
  },
  { name: 'prytula foundation', link: 'https://prytulafoundation.org/en' },
  { name: 'united24', link: 'https://u24.gov.ua/' },
  { name: 'war.ukraine.ua', link: 'https://war.ukraine.ua/donate/' },
];
</script>

<template>
  <div>
    <p class="my-[20px] text-xl">You may donate via the links below:</p>
    <div
      class="flex flex-col gap-4 md:gap-8 text-2xl text-white font-bold uppercase"
    >
      <a
        v-for="l in links"
        :href="l.link"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block hover:text-cyan-300 relative underline hover:no-underline"
      >
        {{ l.name }}
        <span
          class="invisible absolute top-[-10px] right-3 px-[5px] py-[2px] text-lg text-white normal-case bg-gray-800"
        >
          Thank you!
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
a {
  width: fit-content;
}

span {
  transition: all 0.3s ease;
}
a:hover span {
  opacity: 1;
  visibility: visible;
}
</style>
