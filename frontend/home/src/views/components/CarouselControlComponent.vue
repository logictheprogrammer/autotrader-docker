<template>
  <div class="splide__arrows">
    <button
      class="splide__arrow splide__arrow--prev"
      type="button"
      @click="$emit('prev')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M17,11H9.41l3.3-3.29a1,1,0,1,0-1.42-1.42l-5,5a1,1,0,0,0-.21.33,1,1,0,0,0,0,.76,1,1,0,0,0,.21.33l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L9.41,13H17a1,1,0,0,0,0-2Z"
        ></path>
      </svg>
    </button>
    <button
      class="splide__arrow splide__arrow--next"
      type="button"
      @click="$emit('next')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['next', 'prev'])
</script>

<style scoped></style>
