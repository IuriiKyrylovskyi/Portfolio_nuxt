<script></script>

<template>
  <div class="h-1/2 lg:h-full lg:w-1/2 relative">
    <nuxt-img
      src="./me/3.png"
      alt="creator"
      :placeholder="[508, 654]"
      width="508"
      height="654"
      fill
      class="object-contain"
      loading="lazy"
    />
  </div>
  <div
    class="h-1/2 lg:h-full lg:w-1/2 flex flex-col gap-8 items-center justify-center my-8"
  >
    <h1 class="text-4xl md:text-6xl font-bold">
      Crafting Digital Experiences, Designing Tomorrow.
    </h1>
    <p class="md:text-xl">
      Welcome to my digital canvas, where innovation and creativity converge.
      With a keen eye for aesthetics and a mastery of code, my portfolio
      showcases a diverse collection of projects that reflect my commitment to
      excellence.
    </p>
    <div class="w-full flex gap-4">
      <!-- <button
        class="p-4 rounded-lg ring-1 ring-[#e5e7eb] bg-black text-white transition duration-300 linear hover:bg-white hover:text-black hover:animate-none"
      >
        <NuxtLink :to="Routes.PORTFOLIO">View My Works</NuxtLink>
      </button>
      <button
        class="p-4 rounded-lg ring-1 ring-[#e5e7eb] bg-black text-white animate-pulse transition duration-300 linear hover:bg-white hover:text-black hover:animate-none"
      >
        <RouterLink :to="Routes.CONTACT">Contact Me</RouterLink>
      </button> -->
    </div>
  </div>
</template>
