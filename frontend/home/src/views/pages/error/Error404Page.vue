<template>
  <div class="page-404">
    <h1 class="page-404__title">404</h1>
    <p class="page-404__text">The page you are looking for is not available!</p>
    <RouterLink :to="{ name: 'home' }" class="page-404__btn">Home</RouterLink>
  </div>
</template>

<script setup></script>

<style scoped></style>
