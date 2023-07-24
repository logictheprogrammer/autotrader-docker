<template>
  <input
    type="checkbox"
    id="switch"
    :checked="checked"
    @click="$emit('click', checked)"
  /><label for="switch"></label>
</template>

<script setup lang="ts">
defineProps<{ checked: boolean }>()
defineEmits(['click'])
</script>

<style scoped>
input[type='checkbox'] {
  height: 0;
  width: 0;
  visibility: hidden;
}

label {
  cursor: pointer;
  text-indent: -9999px;
  width: 50px;
  height: 25px;
  background: #141a2a;
  display: block;
  border-radius: 100px;
  position: relative;
  margin: 0;
}

label:after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  width: 20px;
  height: 16px;
  background: #3c3c53;
  border-radius: 90px;
  transition: 0.3s;
}

input:checked + label {
  background: rgb(0, 255, 48);
  box-shadow: 0px 0px 3px 0px rgb(0, 255, 48);
}

input:checked + label:after {
  left: calc(100% - 5px);
  transform: translateX(-100%);
  background: #141a2a;
}

label:active:after {
  width: 35px;
}
</style>
