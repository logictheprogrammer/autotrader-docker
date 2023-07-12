<template>
  <!-- article head -->
  <div class="section section--pb0 section--first">
    <div :class="`${head ? head : 'section__article-head'}`">
      <div class="container">
        <div class="row">
          <!-- breadcrumb -->
          <div class="col-12">
            <slot></slot>
          </div>
          <!-- end breadcrumb -->

          <!-- section title -->
          <div class="col-12">
            <div
              class="section__title section__title--left section__title--page"
            >
              <h1>{{ title }}</h1>
            </div>
          </div>
          <!-- end section title -->
        </div>
      </div>

      <MyCanvasComponent></MyCanvasComponent>
    </div>
  </div>
  <!-- end article head -->
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  head: String,
})
</script>

<style scoped></style>
