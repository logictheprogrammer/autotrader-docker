<template>
  <span
    :class="`my-badge rounded-circle ${
      props.class ? props.class : 'text-white bg-danger'
    }`"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>

<style scoped>
.my-badge {
  width: 20px;
  height: 20px;
  padding: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75em;
  font-weight: 700;
  overflow: hidden;
  position: absolute;
}
</style>
