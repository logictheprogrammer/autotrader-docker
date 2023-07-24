<template>
  <div class="timer">
    <span>Logging Out: </span>
    <span class="text-danger"> {{ minutes }}:{{ seconds }} </span>
  </div>
</template>

<script setup>
const second = 1000
const minute = second * 60
const hour = minute * 60

const seconds = ref('00')
const minutes = ref('00')

const countDown = computed(() => useAuthStore().expiresIn)

const counter = () => {
  const now = new Date().getTime()
  const distance = countDown.value - now

  seconds.value = Math.floor((distance % minute) / second)
    .toString()
    .padStart(2, '0')
  minutes.value = Math.floor((distance % hour) / minute)
    .toString()
    .padStart(2, '0')

  if (distance < 1) {
    clearInterval(timer)
  }
}
const timer = setInterval(counter, 1000)
counter()
</script>

<style scoped>
.timer {
  position: fixed;
  z-index: 15;
  right: 0;
  padding: 0.5rem 1rem;
  background-color: white;
}
</style>
