<template>
  <div :id="id" class="section__canvas"></div>
</template>

<script setup lang="ts">
const cell = ref();
const id =
  "canvas-" +
  Math.ceil(Math.random() * 10000000000) +
  "-" +
  Math.ceil(Math.random() * 100000);

const props = defineProps({
  size: Number,
});

onMounted(() => {
  cell.value = window.VANTA.CELLS({
    el: `#${id}`,
    mouseControls: false,
    touchControls: false,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    color1: 0x227f9e,
    color2: 0xaa72ce,
    size: props.size ?? 3.0,
    speed: 1.0,
  });
});
onBeforeUnmount(() => {
  cell.value.destroy();
});
</script>

<style scoped></style>
