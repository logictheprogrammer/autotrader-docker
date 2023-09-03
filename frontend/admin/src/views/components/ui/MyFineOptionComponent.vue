<template>
  <div class="custom-select-item" :style="{ minWidth: minWidth || '150px' }">
    <input type="radio" :checked="selected" /><label
      class="option-label option-cards overflow-hidden text-nowrap"
    >
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selected: boolean
  minWidth?: string
}>()
</script>

<style scoped>
input {
  display: none;
}

.custom-select-item {
  min-width: 120px;
  max-width: 100%;
  flex: 1;
}

.option-cards {
  position: relative;
  color: #707894;
  background-color: transparent;
  text-align: center;
  display: block;
  cursor: pointer;
  border: 2px solid var(--background);
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 12px;
  margin-bottom: 0;
  padding: 1rem 0.5rem;
}

input:checked + label.option-cards {
  border-color: var(--primary) !important;
  position: relative !important;
  display: block !important;
  border-width: 2px;
  color: var(--primary);
}

input:checked + label:after {
  content: '';
  width: 20px;
  height: 20px;
  line-height: 17px;
  border-style: solid;
  border-width: 0 35px 35px 0px;
  border-color: var(--primary) var(--primary) transparent;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
}

input:checked + label:after {
  content: '';
  width: 20px;
  height: 20px;
  line-height: 17px;
  border-style: solid;
  border-width: 0 35px 35px 0px;
  border-color: var(--primary) var(--primary) transparent;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
}

input:checked + label:before {
  content: '\2713';
  z-index: 999;
  position: absolute;
  top: -11px;
  right: 4px;
  font-size: 14px;
  color: #ffffff;
  line-height: 46px;
}
</style>
