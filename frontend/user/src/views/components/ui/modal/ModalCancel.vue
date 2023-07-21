<template>
  <div>
    <div
      class="swal2-icon swal2-error swal2-animate-error-icon"
      style="display: flex"
    >
      <span class="swal2-x-mark"
        ><span class="swal2-x-mark-line-left"></span
        ><span class="swal2-x-mark-line-right"></span
      ></span>
    </div>
    <h5 class="modal-title text-center"><slot></slot></h5>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
