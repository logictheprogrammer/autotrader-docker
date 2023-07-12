<template>
  <select :class="`filter__select ${id}`" name="blockchain">
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
const mySelect = ref()
const id = 'select-' + Math.ceil(Math.random() * 1000000)

defineProps({
  options: {
    type: Array<{
      value: string | number
      name: string | number
    }>,
    required: true,
  },
})

onMounted(() => {
  mySelect.value = window.$(`.filter__select.${id}`).select2({
    minimumResultsForSearch: Infinity,
    theme: 'default filter__select2',
  })
})

onUnmounted(() => {
  mySelect.value.select2('destroy')
})
</script>

<style scoped></style>
