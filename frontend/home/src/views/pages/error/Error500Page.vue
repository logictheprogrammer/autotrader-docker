<template>
  <div class="page-404">
    <h1 class="page-404__title">500</h1>
    <p class="page-404__text">Oops, something went wrong.</p>
    <p class="page-404__text">
      Try refreshing the page or feel free to contact us if the problem
      persists.
    </p>
    <RouterLink :to="{ name: 'home' }" class="page-404__btn">Home</RouterLink>
  </div>
</template>

<script setup></script>

<style scoped></style>
