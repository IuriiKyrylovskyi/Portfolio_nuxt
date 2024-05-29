<script setup lang="ts">
import { errorTable } from '@/utils/constants/errorTable';
import PageContainer from '@/components/common/PageContainer.vue';
import { Routes } from '@/interfaces/global';
import { RouterLink } from 'vue-router';

const startAnimation = ref(false);

setTimeout(() => {
  startAnimation.value = !startAnimation.value;
}, 500);

watchEffect(() => {
  if (startAnimation.value) {
    const collection = document.querySelectorAll('#wordsearch > ul > .word');

    setTimeout(() => {
      collection.forEach((element, i) => {
        setTimeout(() => {
          element.classList.add('selected');
        }, i * 200);
      });
    }, 500);
  }
});
</script>

<template>
  <PageContainer>
    <div id="wrap" class="flex flex-col gap-10 items-center my-20 m-auto">
      <div id="wordsearch">
        <ul>
          <li v-for="cell in errorTable" :key="cell.letter" :class="cell.class">
            {{ cell.letter }}
          </li>
        </ul>
      </div>

      <h3 class="text-2xl">We couldn't find what you were looking for.</h3>
      <div id="main-content" class="flex flex-col gap-3 text-xl max-w-[700px]">
        <p>
          Unfortunately the page you were looking for could not be found. It may
          be temporarily unavailable, moved or no longer exist.
        </p>

        <p>
          Check the URL you entered for any mistakes and try again or
          <RouterLink
            :to="Routes.HOME"
            class="transition linear duration-300 underline hover:text-amber-300 hover:no-underline"
            >back to Home page</RouterLink
          ><span class="text-inherit underline">?</span>
        </p>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
#wrap {
  font-family: 'Source Sans Pro', sans-serif;
  -webkit-font-smoothing: antialiased;
}
#wordsearch {
  width: 460px;
  float: left;

  @media (max-width: 500px) {
    width: calc(100% - 24px);
  }
}

#wordsearch ul {
  margin: 0px;
  padding: 0px;
}

#wordsearch ul li {
  float: left;
  width: 12%;
  aspect-ratio: 1 / 1;
  background-color: rgba(253, 253, 253, 0.2);
  list-style: none;
  margin-right: 0.5%;
  margin-bottom: 0.5%;
  padding: 0;
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  overflow: hidden;
  font-size: 32px;
  font-weight: 300;
  transition: background-color 0.75s ease;
  -moz-transition: background-color 0.75s ease;
  -webkit-transition: background-color 0.75s ease;
  -o-transition: background-color 0.75s ease;

  @media (max-width: 500px) {
    font-size: 7vw;
  }
}

#wordsearch ul li.selected {
  background-color: rgba(26, 188, 156, 0.7);
  color: rgba(255, 255, 255, 1);
  font-weight: 400;
}

@media (hover: hover) {
  a:hover ~ span {
    display: none;
  }
}
</style>
