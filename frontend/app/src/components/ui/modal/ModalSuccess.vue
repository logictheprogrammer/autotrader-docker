<template>
  <div>
    <div
      class="swal2-icon swal2-success swal2-animate-success-icon"
      style="display: flex"
    >
      <div
        class="swal2-success-circular-line-left"
        style="background-color: var(--skin)"
      ></div>
      <span class="swal2-success-line-tip"></span>
      <span class="swal2-success-line-long"></span>
      <div class="swal2-success-ring"></div>
      <div
        class="swal2-success-fix"
        style="background-color: var(--skin)"
      ></div>
      <div
        class="swal2-success-circular-line-right"
        style="background-color: var(--skin)"
      ></div>
    </div>
    <h5 class="modal-title text-center"><slot></slot></h5>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
