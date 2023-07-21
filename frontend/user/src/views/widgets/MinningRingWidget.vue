<template>
  <div class="minning-wrapper">
    <MinningRingProgress />
    <div class="mining-container">
      <MinningRingSpinner />
      <MinningRingInfo />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.minning-wrapper {
  background-image: url(/images/pattern/round.png);
  background-image: linear-gradient(0deg, #141a2a 0%, #1d263b00 50%),
    url(/images/pattern/round.png);
  background-position: center;
  background-size: cover;
  padding: 1.2rem;
  width: 100%;
  position: relative;
  border-right: 1px solid #141a2a !important;
}

.mining-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  aspect-ratio: 1/1;
  font-weight: 400;
  font-size: 20px;
  color: #333;
  list-style-type: none;
  text-decoration: none;
  position: relative;
}
</style>
