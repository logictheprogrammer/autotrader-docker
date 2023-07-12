<template>
  <select :class="`filter__select ${id}`" name="blockchain">
    <option v-for="option in options" :value="option.value">
      {{ option.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
const mySelect = ref();
const id =
  "select-" +
  Math.ceil(Math.random() * 10000000000) +
  "-" +
  Math.ceil(Math.random() * 100000);

defineProps({
  options: {
    type: Array<{
      value: String | Number | Boolean;
      name: String | Number | Boolean;
    }>,
    required: true,
  },
});

onMounted(() => {
  mySelect.value = window.$(`.filter__select.${id}`).select2({
    minimumResultsForSearch: Infinity,
    theme: "default filter__select2",
  });
});

onUnmounted(() => {
  mySelect.value.select2("destroy");
});
</script>

<style scoped></style>
